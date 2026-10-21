// Live subtitle styling for Jellyfin web (works with stock and WebGPU players).
// Adds a CC button to the player OSD next to the gear. One <style> driven by values: changes repaint instantly.
(() => {
  const init = () => {
    const KEY = 'subLive', D = { size: 1, color: '#ffffff', bg: 0, bgColor: '#000000', edge: 1, pos: 8, font: '' };
    // Suggestions only: any font installed on the viewing device can be typed in
    const FONTS = ['Angsana New', 'AngsanaUPC', 'DilleniaUPC', 'Cordia New', 'Browallia New', 'TH Sarabun New', 'Leelawadee UI', 'Tahoma', 'Arial', 'Verdana', 'Segoe UI', 'Trebuchet MS', 'Georgia', 'Times New Roman', 'Courier New', 'Consolas', 'Comic Sans MS', 'Impact'];
    // Google Fonts with Thai glyphs, fetched only when one is selected (works on any device)
    const WEB = ['Sarabun', 'Mitr', 'Prompt', 'Kanit', 'Noto Sans Thai'];
    const loaded = new Set();
    const loadWeb = name => {
      if (!WEB.includes(name) || loaded.has(name)) return;
      loaded.add(name);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:wght@400;700&display=swap`;
      document.head.append(link);
    };
    let s = { ...D };
    try { Object.assign(s, JSON.parse(localStorage.getItem(KEY))); } catch {}

    const css = document.createElement('style');
    document.head.append(css);
    const apply = () => {
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
      const bg = s.bgColor + Math.round(s.bg * 255).toString(16).padStart(2, '0');
      loadWeb(s.font);
      const ff = s.font ? `font-family:"${s.font.replace(/["\;{}]/g, '')}", sans-serif` : '';
      const sh = s.edge ? '0 0 4px #000,1px 1px 2px #000,-1px -1px 2px #000' : 'none';
      // !important beats the inline styles Jellyfin sets on the subtitle element
      css.textContent = `
        .videoSubtitlesInner{font-size:${s.size}em!important;color:${s.color}!important;background:${bg}!important;text-shadow:${sh}!important;${ff ? ff + '!important' : ''}}
        .videoSubtitles{bottom:${s.pos}%!important}
        .htmlvideoplayer::cue{color:${s.color};background-color:${bg};text-shadow:${sh};${ff}}
        #subLivePanel{position:fixed;z-index:99999;width:18em;padding:1em 1.2em;border-radius:.4em;background:rgba(28,28,28,.97);color:#fff;font-size:1em;box-shadow:0 .4em 1.5em #000a}
        #subLivePanel h3{margin:0 0 .6em;font-size:1.05em;font-weight:500}
        #subLivePanel .r{display:flex;align-items:center;justify-content:space-between;gap:1em;margin:.5em 0}
        #subLivePanel input[type=range]{flex:1;max-width:9em;accent-color:var(--theme-primary-color,#e50914)}
        #subLivePanel input[type=checkbox]{width:1.2em;height:1.2em;accent-color:var(--theme-primary-color,#e50914)}
        #subLivePanel input[type=color]{width:2.4em;height:1.6em;padding:0;border:1px solid #fff4;border-radius:.2em;background:none}
        #subLivePanel input[type=text]{flex:1;max-width:10em;padding:.3em .4em;border:1px solid #fff3;border-radius:.25em;background:#2a2a2a;color:#fff;font:inherit}
        #subLivePanel button{margin-top:.4em;padding:.4em 1em;border:0;border-radius:.25em;background:#fff2;color:#fff;cursor:pointer}
        #subLivePanel button:hover{background:#fff4}`;
    };
    apply();

    const row = (label, key, attrs) => `<label class="r">${label}<input data-k="${key}" ${attrs}></label>`;
    const panel = document.createElement('div');
    panel.id = 'subLivePanel';
    panel.hidden = true;
    const fontRow = '<label class="r">Font<input data-k="font" type="text" list="subLiveFonts" placeholder="Default" autocomplete="off" spellcheck="false"></label>'
      + '<datalist id="subLiveFonts">' + FONTS.map(n => `<option value="${n}">`).join('') + WEB.map(n => `<option value="${n}" label="${n} (web font)">`).join('') + '</datalist>';
    panel.innerHTML = '<h3>Subtitle style</h3>'
      + row('Size', 'size', 'type=range min=.5 max=3 step=.05') + fontRow + row('Color', 'color', 'type=color')
      + row('Background', 'bg', 'type=range min=0 max=1 step=.05') + row('Bg color', 'bgColor', 'type=color')
      + row('Outline', 'edge', 'type=checkbox') + row('Position', 'pos', 'type=range min=0 max=40 step=1')
      + '<button data-reset>Reset</button>';
    document.body.append(panel);

    const sync = () => panel.querySelectorAll('[data-k]').forEach(i => {
      i.type === 'checkbox' ? (i.checked = !!s[i.dataset.k]) : (i.value = s[i.dataset.k]);
    });
    sync();
    panel.addEventListener('input', e => {
      const i = e.target, k = i.dataset.k;
      if (!k) return;
      s[k] = i.type === 'checkbox' ? +i.checked : i.type === 'range' ? +i.value : i.value;
      apply();
    });
    panel.querySelector('[data-reset]').onclick = () => { s = { ...D }; sync(); apply(); };

    const CC = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>';

    // Put the button in the OSD button row, left of the gear; the OSD is rebuilt per playback so retry briefly
    const mount = (tries = 12) => {
      if (document.getElementById('btnSubLive')) return;
      // gear first; else the stock subtitles button (we go after it); else the end of the OSD button row
      const gear = document.querySelector('.btnVideoOsdSettings');
      const anchor = gear || document.querySelector('.btnSubtitles');
      if (!anchor) { if (tries) setTimeout(() => mount(tries - 1), 500); return; }
      // Clone the gear: same element type, classes and styling as the other OSD buttons
      const btn = (gear || anchor).cloneNode(false);
      btn.id = 'btnSubLive';
      btn.classList.remove('btnVideoOsdSettings', 'btnSubtitles', 'hide');
      btn.title = 'Subtitle style';
      btn.setAttribute('aria-label', 'Subtitle style');
      btn.innerHTML = CC;
      btn.onclick = () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) {
          const r = btn.getBoundingClientRect();
          panel.style.right = Math.max(8, innerWidth - r.right - 8) + 'px';
          panel.style.bottom = (innerHeight - r.top + 12) + 'px';
        }
      };
      if (gear) gear.before(btn);
      else anchor.after(btn);
    };
    const route = () => {
      if (location.hash.startsWith('#/video')) mount();
      else panel.hidden = true;
    };
    addEventListener('popstate', () => setTimeout(route, 500));
    addEventListener('hashchange', () => setTimeout(route, 500));
    document.addEventListener('click', e => {
      if (!panel.hidden && !panel.contains(e.target) && !e.target.closest('#btnSubLive')) panel.hidden = true;
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') panel.hidden = true; });
    // The OSD is built when playback starts, whatever the route timing: watch for it (childList only, one getElementById when mounted)
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        try { if (!document.getElementById('btnSubLive') && document.querySelector('.btnVideoOsdSettings')) mount(0); } catch (e) { console.error('subLive', e); }
      });
    }).observe(document.body, { childList: true, subtree: true });
    route();
  };
  // Start after the page has fully loaded so Jellyfin's own startup is never disturbed; errors stay contained.
  // Kill switch: localStorage.subLiveOff = '1'
  const start = () => { try { if (!localStorage.getItem('subLiveOff')) init(); } catch (e) { console.error('subLive', e); } };
  document.readyState === 'complete' ? start() : addEventListener('load', start);
})();
