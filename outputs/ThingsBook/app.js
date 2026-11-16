'use strict';
const $ = id => document.getElementById(id);
const DB_NAME = 'thingsbook-encrypted-v1', DB_VERSION = 4;
// PDFs are streamed at import and opened by byte range, so they may be larger; other formats are
// still read whole when imported and opened.
const MAX_FILE = 100 * 1024 * 1024, MAX_PDF = 500 * 1024 * 1024;
const isPdfFile = async file => { try { return new TextDecoder().decode(new Uint8Array(await file.slice(0,1024).arrayBuffer())).includes('%PDF-'); } catch { return false; } };
const encoder = new TextEncoder(), decoder = new TextDecoder();
let db, config, key, books = [], shelves = [], filter = 'all', view = 'shelf',libraryPage=0,libraryQuery='';
let pendingBackup = null, activeBook = null, readerUrl = null, busy = false, idleTimer;
let metadataQueue = Promise.resolve(), pendingLock = null;
let storagePreview=0;
let libraryNeedsRender=false,searchTimer,importRun=null;
let hasDeviceAccess = false;
const palette = ['#31534a','#71564d','#8b754c','#5a637b','#747f59','#765668'];
function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').classList.remove('visible'), 5000); }
// ... truncated for this example; real call would have full content