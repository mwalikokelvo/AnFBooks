'use strict';
// The Kevo voice pack: the 13 voices AnF ships (vendor/voice-pack/, see SOURCES.txt). The recordings
// are samples, not a speech engine, so a pack voice reads with the installed device voice (Windows,
// Android or browser) that best matches its accent and gender; "Hear this voice" plays the recording.
// A pack choice is stored as "pack:<id>" and resolved to a device voice id each time narration starts.
(function () {
  const PROFILES = [
    {id:'kelvin-mwamburi', name:'Kevo (Gentle Bass)', file:'Kevo - gentle bass.mp3', accent:'en', gender:'male'},
    {id:'nath-british-calm', name:'Nath (British & Calm)', file:'Nath - engaging, british and calm.mp3', accent:'en-GB', gender:'male'},
    {id:'burt-deep-smooth', name:'Burt (Deep, Smooth & Clear)', file:'Burt - deep, smooth and clear.mp3', accent:'en-US', gender:'male'},
    {id:'dav-movie-trailer', name:'Dav (Movie Trailer Narrator)', file:'Dav - movie trailer narrator.mp3', accent:'en-US', gender:'male'},
    {id:'cart-rugged', name:'Cart (Rich, Smooth & Rugged)', file:'Cart - rich, smooth and rugged.mp3', accent:'en-US', gender:'male'},
    {id:'bria-resonant', name:'Bria (Deep, Resonant & Comforting)', file:'Bria - deep, resonant and comforting.mp3', accent:'en-US', gender:'female'},
    {id:'jean-audiobook', name:'Jean (Audiobook Narrator)', file:'Jean - audiobook narrator.mp3', accent:'en-US', gender:'female'},
    {id:'aust-raspy', name:'Aust (Deep, Raspy & Authentic)', file:'Aust - deep, raspy and authentic.mp3', accent:'en-US', gender:'male'},
    {id:'bra-gentle', name:'Bra (Gentle & Romantic)', file:'Bra - romantic & gentle.mp3', accent:'en-US', gender:'female'},
    {id:'lil-velvety', name:'Lil (Velvety Actress)', file:'Lil - velvety actress.mp3', accent:'en-US', gender:'female'},
    {id:'seraf-sensual', name:'Seraf (Melodic & Warm)', file:'Seraf - sensual temptress.mp3', accent:'en-US', gender:'female'},
    {id:'husky-bold', name:'Husky (Engaging & Bold)', file:'Husky, engaging and bold.mp3', accent:'en-US', gender:'male'},
    {id:'grandpa', name:'Grandpa (Wise & Gentle)', file:'grandpa.mp3', accent:'en-US', gender:'male'},
  ];
  // Same name lists AnF uses to tell female and male system voices apart.
  const FEMALE = /\b(female|woman|aria|jenny|michelle|sonia|libby|maisie|natasha|clara|emma|ava|ana|zira|hazel|susan|samantha|karen|moira|tessa|serena|victoria|fiona|kate|heera|neerja|zuri|imani)\b/i;
  const MALE = /\b(male|man|guy|ryan|christopher|eric|roger|steffan|thomas|brian|andrew|william|liam|david|mark|george|daniel|james|alex|fred|oliver|arthur|elimu|abeo)\b/i;
  const SYSTEM = /^(windows|android|device):/;
  const language = option => String(option.language || option.voice?.lang || (/United Kingdom|Great Britain|\bUK\b/i.test(option.label) ? 'en-GB' : /United States|\bUS\b/i.test(option.label) ? 'en-US' : /English/i.test(option.label) ? 'en' : '')).replace('_', '-').toLowerCase();
  const profile = id => PROFILES.find(p => 'pack:' + p.id === id) || null;

  // Picks the device voice for a pack voice: English only, natural/neural first, then accent, then gender.
  function resolve(id, options) {
    const wanted = profile(id); if (!wanted) return id;
    let best = null, bestScore = -Infinity;
    for (const option of options || []) {
      if (!SYSTEM.test(option.id)) continue;
      const lang = language(option); if (lang && !lang.startsWith('en')) continue;
      let score = 0;
      if (/natural|neural|online/i.test(option.label)) score += 6; else if (/google/i.test(option.label)) score += 3;
      if (lang === wanted.accent.toLowerCase()) score += 3; else if (lang.startsWith(wanted.accent.slice(0, 2))) score += 1;
      if (wanted.gender === 'female') score += FEMALE.test(option.label) ? 4 : MALE.test(option.label) ? -4 : 0;
      if (wanted.gender === 'male') score += MALE.test(option.label) ? 4 : FEMALE.test(option.label) ? -4 : 0;
      if (score > bestScore) { best = option; bestScore = score; }
    }
    return best ? best.id : 'unavailable';
  }
  // Pack entries for the Voice list, offered only when a device voice can read them.
  const options = list => (list || []).some(o => SYSTEM.test(o.id)) ? PROFILES.map(p => ({id:'pack:' + p.id, label:'Kevo pack: ' + p.name})) : [];
  const sampleUrl = id => { const p = profile(id); return p ? 'vendor/voice-pack/' + encodeURIComponent(p.file) : null; };
  window.ThingsVoicePack = Object.freeze({profiles:PROFILES, options, resolve, sampleUrl});
})();
