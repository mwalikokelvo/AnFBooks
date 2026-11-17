//! Latency budgets from the engineering spec. CI runs these with `--release`
//! (`cargo test --release --locked --test latency`); debug builds only check correctness.
use std::io::{Cursor, Write};
use std::time::{Duration, Instant};
use thingsbook::{parse_opds, DocumentSession};

const SPINE: usize = 300;

fn p95(runs: usize, mut f: impl FnMut()) -> Duration {
    for _ in 0..3 {
        f();
    }
    let mut times: Vec<Duration> = (0..runs)
        .map(|_| {
            let start = Instant::now();
            f();
            start.elapsed()
        })
        .collect();
    times.sort();
    times[runs * 95 / 100]
}

fn budget(name: &str, limit_ms: u64, took: Duration) {
    println!(
        "{name}: p95 {:.2} ms (budget {limit_ms} ms)",
        took.as_secs_f64() * 1000.0
    );
    if cfg!(not(debug_assertions)) {
        assert!(took < Duration::from_millis(limit_ms), "{name} over budget");
    }
}

fn epub(version: &str) -> Vec<u8> {
    let mut zip = zip::ZipWriter::new(Cursor::new(Vec::new()));
    let deflate = zip::write::SimpleFileOptions::default();
    let mut add = |path: &str, data: &str| {
        zip.start_file(path, deflate).unwrap();
        zip.write_all(data.as_bytes()).unwrap();
    };
    add("mimetype", "application/epub+zip");
    add(
        "META-INF/container.xml",
        r#"<container><rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>"#,
    );
    let manifest: String = (0..SPINE)
        .map(|i| {
            format!(r#"<item id="c{i}" href="c{i}.xhtml" media-type="application/xhtml+xml"/>"#)
        })
        .collect();
    let spine: String = (0..SPINE)
        .map(|i| format!(r#"<itemref idref="c{i}"/>"#))
        .collect();
    add(
        "OPS/book.opf",
        &format!(
            r#"<package version="{version}" xmlns:dc="http://purl.org/dc/elements/1.1/"><metadata><dc:title>Long book</dc:title><dc:creator>A writer</dc:creator><dc:language>en</dc:language></metadata><manifest>{manifest}</manifest><spine>{spine}</spine></package>"#
        ),
    );
    let paragraph = "<p>It was a quiet morning and the reader turned the page slowly, listening to the rain.</p>";
    for i in 0..SPINE {
        // ~20 KB of text per chapter, about a novel's chapter.
        add(
            &format!("OPS/c{i}.xhtml"),
            &format!(
                "<html><body><h1>Chapter {i}</h1>{}</body></html>",
                paragraph.repeat(220)
            ),
        );
    }
    zip.finish().unwrap().into_inner()
}

#[test]
fn epub_open_spine_and_first_chapter_under_150ms() {
    for version in ["2.0", "3.0"] {
        let data = epub(version);
        let mut chars = 0;
        let took = p95(20, || {
            let doc = DocumentSession::open(data.clone(), "EPUB".into()).unwrap();
            assert_eq!(doc.metadata().unwrap().chapters as usize, SPINE);
            chars = doc.chapter(0).unwrap().len();
            doc.close().unwrap();
        });
        assert!(chars > 15_000);
        budget(&format!("EPUB {version} open + spine + chapter"), 150, took);
    }
}

#[test]
fn opds_parse_under_100ms() {
    let entries: String = (0..200)
        .map(|i| {
            format!(
                r#"<entry><id>urn:uuid:{i}</id><title>Book {i}</title><author><name>Writer {i}</name></author><summary>A summary of book {i} &amp; its story.</summary><dc:language>en</dc:language><category term="fiction"/><link rel="http://opds-spec.org/acquisition/open-access" href="books/{i}.epub" type="application/epub+zip"/><link rel="http://opds-spec.org/image" href="covers/{i}.jpg"/></entry>"#
            )
        })
        .collect();
    let feed = format!(
        r#"<feed xmlns="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/terms/"><title>Library</title><link rel="next" href="?page=2"/>{entries}</feed>"#
    );
    let took = p95(40, || {
        let parsed = parse_opds(feed.clone(), "https://example.org/opds/".into()).unwrap();
        assert_eq!(parsed.publications.len(), 200);
    });
    budget("OPDS 200-entry Atom parse", 100, took);
}
