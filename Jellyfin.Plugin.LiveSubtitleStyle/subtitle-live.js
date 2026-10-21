// Live subtitle styling for Jellyfin web (works with stock and WebGPU players).
// Adds an "Aa" button to the player OSD next to the gear. One <style> driven by values: changes repaint instantly.
(() => {
  const init = () => {
    const KEY = 'subLive', D = { size: 1, color: '#ffffff', bg: 0, bgColor: '#000000', edge: 1, edgeW: 1.5, pos: 8, font: '' };
    const ACC = 'var(--theme-primary-color,#e50914)';
    // Suggestions, filtered to the fonts this browser can really use (see avail); any installed font can still be typed in
    const FONTS = ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Segoe UI', 'Calibri', 'Georgia', 'Times New Roman', 'Courier New', 'Consolas', 'Comic Sans MS', 'Impact'];
    // Google Fonts offered as one-click web fonts; any other family name that is not installed is looked up there too
    const WEB = ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Inter', 'Noto Sans', 'Noto Serif', 'Merriweather', 'Oswald'];
    // Sample text in several scripts, so a font is detected whichever script it covers
    const PROBES = ['mwiQ0Oil', 'Яжфыя', 'αβγδε', 'مرحبا', 'שלום', 'नमस्ते', 'สวัสดี', '你好世界', 'こんにちは', '안녕하세요'];
    const family = n => /^[A-Za-z0-9][A-Za-z0-9 ]{0,40}$/.test(n);
    // True when this browser can really render the font: its text measures differently from every fallback for at least one script
    const avail = n => {
      try {
        const c = document.createElement('canvas').getContext('2d');
        const w = (f, text) => { c.font = '40px ' + f; return c.measureText(text).width; };
        return PROBES.some(p => ['monospace', 'serif', 'sans-serif'].some(b => w(`"${n}",${b}`, p) !== w(b, p)));
      } catch { return null; }
    };
    const web = {}; // family -> true / false once Google Fonts has answered, null while waiting
    let refreshFont = () => {};
    const loadWeb = name => {
      if (!family(name) || name in web) return;
      web[name] = null;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:wght@400;700&display=swap`;
      link.onload = () => document.fonts.load(`16px "${name}"`).then(f => { web[name] = f.length > 0; refreshFont(); }, () => { web[name] = false; refreshFont(); });
      link.onerror = () => { web[name] = false; refreshFont(); };
      document.head.append(link);
    };
    // Typing fires many input events: look a name up only after a pause, and never for a font that is installed
    let lookup;
    const wantWeb = () => {
      clearTimeout(lookup);
      if (s.font && avail(s.font) !== true) lookup = setTimeout(() => loadWeb(s.font), 600);
    };
    let s = { ...D };
    try { Object.assign(s, JSON.parse(localStorage.getItem(KEY))); } catch {}

    // Subtitle styling: rewritten on every change
    const css = document.createElement('style');
    document.head.append(css);
    const apply = () => {
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
      const bg = s.bgColor + Math.round(s.bg * 255).toString(16).padStart(2, '0');
      wantWeb();
      const ff = s.font ? `font-family:"${s.font.replace(/["\\;{}]/g, '')}", sans-serif` : '';
      const e = s.edgeW;
      const ring = Array.from({ length: 16 }, (_, k) => [Math.cos(k * Math.PI / 8) * e, Math.sin(k * Math.PI / 8) * e].map(v => v.toFixed(2) + 'px').join(' ') + ' 0 #000');
      const sh = s.edge ? ring.join(',') + `,0 0 ${e * 2}px #000` : 'none';
      // !important beats the inline styles Jellyfin sets on the subtitle element
      css.textContent = `
        .videoSubtitlesInner{font-size:${s.size}em!important;color:${s.color}!important;background:${bg}!important;text-shadow:${sh}!important;${ff ? ff + '!important' : ''}}
        .videoSubtitles{bottom:${s.pos}%!important}
        .videoSubtitlesInner{margin-bottom:0!important}
        .htmlvideoplayer::cue{color:${s.color};background-color:${bg};text-shadow:${sh};${ff}}`;
    };
    apply();

    // Popup styling: static
    const ui = document.createElement('style');
    ui.textContent = `
      #subLivePanel{position:fixed;z-index:99999;width:28em;max-width:calc(100vw - 16px);max-height:calc(100vh - 110px);overflow:auto;box-sizing:border-box;padding:.8em 1.2em;border-radius:1.1em;background:rgba(18,18,20,.97);border:1px solid #ffffff1f;box-shadow:0 1em 3em #000c;color:#fff;font-size:15px;line-height:1.3;font-family:inherit}
      #subLivePanel[hidden]{display:none}
      #subLivePanel .r{display:flex;align-items:center;gap:.8em;padding:.35em 0}
      #subLivePanel .ic{flex:none;width:2.4em;height:2.4em;border-radius:.6em;display:grid;place-items:center;background:#ffffff0d;border:1px solid #ffffff14;color:#ffffffcc}
      #subLivePanel .t{flex:1;min-width:0;font-weight:500}
      #subLivePanel .t small{display:block;font-weight:400;color:#ffffff80;font-size:.8em}
      #subLivePanel .c{flex:none;display:flex;align-items:center;gap:.6em}
      #subLivePanel output{min-width:2.6em;padding:.4em .3em;text-align:center;border-radius:.5em;background:#ffffff0d;border:1px solid #ffffff14;font-size:.9em}
      #subLivePanel input[type=range]{-webkit-appearance:none;appearance:none;width:7.5em;height:.45em;margin:0;border-radius:99px;outline:0;background:linear-gradient(to right,${ACC} var(--p,50%),#ffffff2e var(--p,50%))}
      #subLivePanel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:1.25em;height:1.25em;border-radius:50%;background:#fff;border:.28em solid ${ACC};cursor:pointer}
      #subLivePanel input[type=range]::-moz-range-thumb{width:.7em;height:.7em;border-radius:50%;background:#fff;border:.28em solid ${ACC};cursor:pointer}
      #subLivePanel .fs{position:relative;width:11.5em}
      #subLivePanel .fs input{width:100%;box-sizing:border-box;padding:.55em 2.1em .55em .7em;border-radius:.6em;background:#ffffff0d;border:1px solid #ffffff26;color:#fff;font:inherit}
      #subLivePanel .fs input::-webkit-calendar-picker-indicator{position:absolute;right:0;top:0;width:2.2em;height:100%;opacity:0;cursor:pointer}
      #subLivePanel .fs svg{position:absolute;right:.6em;top:50%;margin-top:-.6em;pointer-events:none;color:#ffffffcc}
      #subLivePanel .sw{display:flex;align-items:center;gap:.3em;padding:.3em .5em;border-radius:.6em;background:#ffffff0d;border:1px solid #ffffff26;color:#ffffffcc}
      #subLivePanel .sw input{width:3.4em;height:1.7em;padding:0;border:0;background:none;cursor:pointer}
      #subLivePanel .sw input::-webkit-color-swatch-wrapper{padding:0}
      #subLivePanel .sw input::-webkit-color-swatch{border:1px solid #ffffff55;border-radius:.3em}
      #subLivePanel .tg{position:relative;width:3.2em;height:1.8em}
      #subLivePanel .tg input{position:absolute;inset:0;z-index:1;margin:0;opacity:0;cursor:pointer}
      #subLivePanel .tg i{position:absolute;inset:0;border-radius:99px;background:#ffffff26;transition:.15s}
      #subLivePanel .tg i::after{content:'';position:absolute;top:.2em;left:.2em;width:1.4em;height:1.4em;border-radius:50%;background:#fff;transition:.15s}
      #subLivePanel .tg input:checked+i{background:${ACC}}
      #subLivePanel .tg input:checked+i::after{left:1.6em}
      #subLivePanel .f{margin-top:.5em;padding-top:.8em;border-top:1px solid #ffffff1a}
      #subLivePanel .rs{display:flex;align-items:center;gap:.6em;padding:.65em 1em;border-radius:.7em;background:#ffffff0d;border:1px solid #ffffff1f;color:#fff;cursor:pointer;font:inherit}
      #subLivePanel .rs:hover{background:#ffffff1a}`;
    document.head.append(ui);

    const P = {
      size: 'M3 4v3h4v10h3V7h4V4H3zm15 1l-3 3h2v8h-2l3 3 3-3h-2V8h2l-3-3z',
      drop: 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z',
      alpha: 'M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8zM6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14H6z',
      edge: 'M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z',
      pos: 'M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z',
      weight: 'M3 17h18v-2H3v2zm0 3h18v-1H3v1zm0-7h18v-3H3v3zm0-9v4h18V4H3z',
      reset: 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
      chev: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
    };
    const svg = (d, n = 22) => `<svg viewBox="0 0 24 24" width="${n}" height="${n}" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
    const row = (icon, label, desc, control) =>
      `<div class="r"><span class="ic">${icon === 'font' ? '<b>Aa</b>' : svg(P[icon])}</span><div class="t">${label}${desc ? `<small>${desc}</small>` : ''}</div><div class="c">${control}</div></div>`;
    const range = (k, attrs) => `<input data-k="${k}" type="range" ${attrs}><output data-o="${k}"></output>`;
    const color = k => `<label class="sw"><input data-k="${k}" type="color">${svg(P.chev, 18)}</label>`;
    const fontControl = '<div class="fs"><input data-k="font" type="text" list="subLiveFonts" placeholder="Default" autocomplete="off" spellcheck="false">' + svg(P.chev, 20) + '</div>'
      + '<datalist id="subLiveFonts">' + FONTS.filter(n => avail(n) !== false).map(n => `<option value="${n}">`).join('') + WEB.map(n => `<option value="${n}" label="${n} (web font)">`).join('') + '</datalist>';

    const panel = document.createElement('div');
    panel.id = 'subLivePanel';
    panel.hidden = true;
    panel.innerHTML = row('size', 'Size', '', range('size', 'min=.5 max=5 step=.05'))
      + row('font', 'Font', '<span data-fs></span>', fontControl)
      + row('drop', 'Text color', '', color('color'))
      + row('alpha', 'Background', 'Adjust background opacity', range('bg', 'min=0 max=1 step=.05'))
      + row('drop', 'Background color', '', color('bgColor'))
      + row('edge', 'Outline', 'Add an outline to improve readability', '<label class="tg"><input data-k="edge" type="checkbox"><i></i></label>')
      + row('weight', 'Outline thickness', 'Width of the outline in pixels', range('edgeW', 'min=.5 max=6 step=.5'))
      + row('pos', 'Position', 'Below 0 goes lower', range('pos', 'min=-10 max=40 step=.5'))
      + `<div class="f"><button class="rs" data-reset>${svg(P.reset, 20)}Reset to default</button></div>`;
    document.body.append(panel);

    // Slider fill and the number box beside it
    const paint = i => {
      if (i.type !== 'range') return;
      i.style.setProperty('--p', (i.value - i.min) / (i.max - i.min) * 100 + '%');
      const o = panel.querySelector(`[data-o="${i.dataset.k}"]`);
      if (o) o.textContent = i.dataset.k === 'size' || i.dataset.k === 'bg' ? Math.round(i.value * 100) : i.dataset.k === 'edgeW' ? i.value + 'px' : i.value;
    };
    // The thickness slider is inert while Outline is off
    const edgeUi = () => {
      const w = panel.querySelector('[data-k=edgeW]');
      w.disabled = !s.edge;
      w.closest('.r').style.opacity = s.edge ? '' : '.45';
    };
    // Say whether the chosen font can actually be used in this browser
    const paintFont = () => {
      const el = panel.querySelector('[data-fs]');
      const n = s.font;
      let text = 'Player default', color = '';
      if (n) {
        // A name that was requested from Google Fonts is a web font from then on, even though the browser can now render it
        if (n in web) {
          if (web[n] === true) text = 'Web font from Google Fonts';
          else if (web[n] === false) { text = 'Not found on this device or Google Fonts'; color = '#ff8a8a'; }
          else text = 'Looking up on Google Fonts…';
        } else {
          const local = avail(n);
          if (local) { text = 'Installed on this device'; color = '#6fd08c'; }
          else if (!family(n)) { text = 'Not found on this device or Google Fonts'; color = '#ff8a8a'; }
          else text = local === null ? '' : 'Looking up on Google Fonts…';
        }
      }
      el.textContent = text;
      el.style.color = color;
    };
    refreshFont = paintFont;
    const sync = () => panel.querySelectorAll('[data-k]').forEach(i => {
      i.type === 'checkbox' ? (i.checked = !!s[i.dataset.k]) : (i.value = s[i.dataset.k]);
      paint(i);
    });
    sync();
    paintFont();
    edgeUi();
    panel.addEventListener('input', e => {
      const i = e.target, k = i.dataset.k;
      if (!k) return;
      s[k] = i.type === 'checkbox' ? +i.checked : i.type === 'range' ? +i.value : i.value;
      paint(i);
      if (k === 'font') paintFont();
      if (k === 'edge') edgeUi();
      apply();
    });
    panel.querySelector('[data-reset]').onclick = () => { s = { ...D }; sync(); paintFont(); edgeUi(); apply(); };

    // Chrome can list the fonts really installed on this device (asks permission once): fills the suggestions with exact names
    let scanned = false;
    panel.querySelector('input[data-k=font]').addEventListener('focus', () => {
      if (scanned || !window.queryLocalFonts) return;
      scanned = true;
      window.queryLocalFonts().then(list => {
        const list_ = panel.querySelector('#subLiveFonts');
        const have = new Set([...list_.options].map(o => o.value));
        [...new Set(list.map(f => f.family))].sort().forEach(n => {
          if (have.has(n)) return;
          const o = document.createElement('option');
          o.value = n;
          list_.append(o);
        });
      }).catch(() => {});
    });

    // "Aa" as an SVG glyph: clearly different from the stock subtitle-track button
    const AA = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><text x="12" y="17" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor" font-family="Arial,sans-serif">Aa</text></svg>';

    // One button next to every OSD gear that lacks one. Jellyfin keeps more than one copy of the button row and
    // rebuilds them when the episode changes, so check each gear instead of looking for a single element.
    // Anywhere in the same row: other plugins (the WebGPU tune button) insert their own buttons next to the gear
    const has = g => !!g.parentElement?.querySelector(':scope > .btnSubLive');
    const mountOn = (gear, before) => {
      // Clone the gear: same element type, classes and styling as the other OSD buttons
      const btn = gear.cloneNode(false);
      btn.removeAttribute('id');
      btn.classList.remove('btnVideoOsdSettings', 'btnSubtitles', 'hide');
      btn.classList.add('btnSubLive');
      btn.title = 'Subtitle style';
      btn.setAttribute('aria-label', 'Subtitle style');
      btn.innerHTML = AA;
      btn.onclick = () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) {
          const r = btn.getBoundingClientRect();
          panel.style.right = Math.max(8, innerWidth - r.right - 8) + 'px';
          panel.style.bottom = (innerHeight - r.top + 12) + 'px';
        }
      };
      before ? gear.before(btn) : gear.after(btn);
    };
    const gearsMissing = () => [...document.querySelectorAll('.btnVideoOsdSettings')].filter(g => !has(g));
    const mountAll = () => {
      const gears = gearsMissing();
      if (gears.length) gears.forEach(g => mountOn(g, true));
      // no gear in this build: go after the stock subtitles button instead
      else if (!document.querySelector('.btnVideoOsdSettings')) document.querySelectorAll('.btnSubtitles').forEach(g => { if (!has(g)) mountOn(g, false); });
    };
    const route = () => {
      if (location.hash.startsWith('#/video')) mountAll();
      else panel.hidden = true;
    };
    addEventListener('popstate', () => setTimeout(route, 500));
    addEventListener('hashchange', () => setTimeout(route, 500));
    document.addEventListener('click', e => {
      if (!panel.hidden && !panel.contains(e.target) && !e.target.closest('.btnSubLive')) panel.hidden = true;
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') panel.hidden = true; });
    // The OSD is built (and rebuilt on every episode change) whatever the route timing: watch for it (childList only, throttled)
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        try { if (gearsMissing().length) mountAll(); } catch (e) { console.error('subLive', e); }
      });
    }).observe(document.body, { childList: true, subtree: true });
    route();
  };
  // Start after the page has fully loaded so Jellyfin's own startup is never disturbed; errors stay contained.
  // Kill switch: localStorage.subLiveOff = '1'
  const start = () => { try { if (!localStorage.getItem('subLiveOff')) init(); } catch (e) { console.error('subLive', e); } };
  document.readyState === 'complete' ? start() : addEventListener('load', start);
})();
