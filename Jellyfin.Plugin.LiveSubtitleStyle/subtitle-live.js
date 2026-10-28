// Live subtitle styling for Jellyfin web (works with stock and WebGPU players).
// Adds an "Aa" button to the player OSD next to the gear. One <style> driven by values: changes repaint instantly.
(() => {
  const init = () => {
    const KEY = 'subLive', D = { size: 1, color: '#ffffff', bg: 0, bgColor: '#000000', edge: 1, edgeW: 1.5, pos: 8, font: '', assOv: 0 };
    const ACC = 'var(--theme-primary-color,#e50914)';
    // Suggestions, filtered to the fonts this browser can really use (see avail); any installed font can still be typed in
    const FONTS = ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Segoe UI', 'Calibri', 'Georgia', 'Times New Roman', 'Courier New', 'Consolas', 'Comic Sans MS', 'Impact'];
    // Google Fonts offered as one-click web fonts; any other family name that is not installed is looked up there too
    const WEB = ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Inter', 'Noto Sans', 'Noto Serif', 'Merriweather', 'Oswald'];
    // Sample text in several scripts, so a font is detected whichever script it covers
    const PROBES = ['mwiQ0Oil', 'Яжфыя', 'αβγδε', 'مرحبا', 'שלום', 'नमस्ते', 'สวัสดี', '你好世界', 'こんにちは', '안녕하세요'];
    // Jellyfin Desktop draws subtitles with mpv and the computer's fonts: the browser's font checks and Google Fonts do not apply
    const desktop = !!window.jmpInfo?.settings?.subtitles;
    const family = n => /^[A-Za-z0-9][A-Za-z0-9 ]{0,40}$/.test(n);
    // True when this browser can really render the font: its text measures differently from every fallback for at least one script
    const avail = n => {
      try {
        const c = document.createElement('canvas').getContext('2d');
        const w = (f, text) => { c.font = '40px ' + f; return c.measureText(text).width; };
        return PROBES.some(p => ['monospace', 'serif', 'sans-serif'].some(b => w(`"${n}",${b}`, p) !== w(b, p)));
      } catch { return null; }
    };
    // Opt-out of all Google Fonts requests: localStorage.subLiveNoWeb = '1'
    const noWeb = (() => { try { return !!localStorage.getItem('subLiveNoWeb'); } catch { return false; } })();
    const web = {}; // family -> true / false once Google Fonts has answered, null while waiting
    let refreshFont = () => {};
    const loadWeb = name => {
      if (noWeb || !family(name) || name in web) return;
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
      if (!desktop && s.font && avail(s.font) !== true) lookup = setTimeout(() => loadWeb(s.font), 600);
    };
    let s = { ...D };
    try { Object.assign(s, JSON.parse(localStorage.getItem(KEY))); } catch {}
    // Stored values are never trusted: numbers are clamped and colours checked before they reach the stylesheet
    const num = (v, lo, hi, d) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Math.min(hi, Math.max(lo, Number(v))) : d);
    const hex = (v, d) => (/^#[0-9a-f]{6}$/i.test(v) ? v : d);
    s = {
      size: num(s.size, .5, 5, D.size), color: hex(s.color, D.color), bg: num(s.bg, 0, 1, D.bg), bgColor: hex(s.bgColor, D.bgColor),
      edge: s.edge ? 1 : 0, edgeW: num(s.edgeW, .1, 15, D.edgeW), pos: num(s.pos, -10, 40, D.pos), assOv: s.assOv ? 1 : 0,
      font: typeof s.font === 'string' && s.font.length <= 60 ? s.font : '',
    };

    // Jellyfin Desktop plays through mpv, which draws the subtitles itself, so the DOM rules below do nothing there.
    // Its settings bridge applies live: map the style onto the subtitles section and the manual mpv config (position, box)
    let pushT = 0, ready = false, unforce = false;
    const push = () => {
      const j = window.jmpInfo?.settings;
      if (!j?.subtitles || !j.other || !window.api?.settings) return;
      // Throttle, not debounce: a debounce never fires while a slider is being dragged
      if (pushT) return;
      pushT = setTimeout(() => {
        pushT = 0;
        const v = {
          size: Math.round(32 * s.size), font: s.font || 'sans-serif', color: s.color,
          border_color: '#000000',
          background_color: s.bgColor, background_transparency: Math.round(s.bg * 255).toString(16).padStart(2, '0'),
        };
        for (const k in v) if (j.subtitles[k] !== v[k]) j.subtitles[k] = v[k];
        // The settings list has no free position or box style, so own a marked block of the manual mpv config
        // Desktop applies this config after its own subtitle settings, so forcing the ASS override here wins over the
        // native ASS Style Override without changing it. Turned off, mpv keeps force until something sets it again:
        // write the native value once, then drop the line so later native changes apply as usual.
        const ass = s.assOv ? 'sub-ass-override=force' : unforce ? `sub-ass-override=${j.subtitles.ass_style_override || 'yes'}` : '';
        const conf = ['# subLive', `sub-pos=${100 - s.pos}`, `sub-border-size=${s.edge ? +s.edgeW.toFixed(2) : 0}`, `sub-border-style=${s.bg > 0 ? 'background-box' : 'outline-and-shadow'}`, ass, '# /subLive'].filter(Boolean).join('\n');
        const text = String(j.other.other_conf ?? '').replace(/# subLive[\s\S]*?# \/subLive/g, '').trim();
        const next = (text ? text + '\n' : '') + conf;
        if (j.other.other_conf !== next) j.other.other_conf = next;
        if (unforce) { unforce = false; setTimeout(push, 300); }
      }, 80);
    };

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
      if (ready) push();
    };
    apply();
    ready = true; // the desktop client keeps its own settings until the first change here
    // 1.3.20.0 set the native ASS Style Override to force: put the user's own value back, the toggle now forces it itself
    try {
      const p = localStorage.getItem('subLiveAssPrev'), j = window.jmpInfo?.settings?.subtitles;
      if (p !== null && j) {
        localStorage.removeItem('subLiveAssPrev');
        if (j.ass_style_override === 'force') { j.ass_style_override = p; s.assOv = 1; apply(); }
      }
    } catch {}

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
      #subLivePanel .cp{position:relative;display:flex;align-items:center;gap:.5em}
      #subLivePanel .pk{width:3.4em;height:1.9em;padding:0;border-radius:.4em;border:1px solid #ffffff66;cursor:pointer}
      #subLivePanel .pp{position:absolute;right:0;top:100%;z-index:4;width:14em;box-sizing:border-box;margin-top:.4em;padding:.7em;border-radius:.8em;background:#1c1c20;border:1px solid #ffffff26;box-shadow:0 .5em 1.5em #000a}
      #subLivePanel .pp[hidden]{display:none}
      #subLivePanel .sv{position:relative;height:8em;border-radius:.5em;cursor:crosshair;touch-action:none;background:linear-gradient(to top,#000,#0000),linear-gradient(to right,#fff,#0000),hsl(var(--h,0),100%,50%)}
      #subLivePanel .sv i{position:absolute;left:var(--x,0%);top:var(--y,0%);width:.9em;height:.9em;margin:-.45em 0 0 -.45em;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #000;pointer-events:none}
      #subLivePanel .pp input.hu{width:100%;margin-top:.7em;background:linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)}
      #subLivePanel .fl{position:absolute;left:0;right:0;top:100%;z-index:3;max-height:11em;overflow:auto;margin-top:.2em;background:#1c1c20;border:1px solid #ffffff26;border-radius:.6em;box-shadow:0 .5em 1.5em #000a}
      #subLivePanel .fl[hidden]{display:none}
      #subLivePanel .fl button{display:block;width:100%;padding:.45em .7em;text-align:left;background:none;border:0;color:#fff;font:inherit;cursor:pointer}
      #subLivePanel .fl button:hover{background:#ffffff1a}
      #subLivePanel .num{width:4.2em;box-sizing:border-box;padding:.4em .3em;text-align:center;border-radius:.5em;background:#ffffff0d;border:1px solid #ffffff14;color:#fff;font:inherit;font-size:.9em}
      #subLivePanel .num:disabled{opacity:.5}
      #subLivePanel .tg{position:relative;width:3.2em;height:1.8em}
      #subLivePanel .tg input{position:absolute;inset:0;z-index:1;margin:0;opacity:0;cursor:pointer}
      #subLivePanel .tg i{position:absolute;inset:0;border-radius:99px;background:#ffffff26;transition:.15s}
      #subLivePanel .tg i::after{content:'';position:absolute;top:.2em;left:.2em;width:1.4em;height:1.4em;border-radius:50%;background:#fff;transition:.15s}
      #subLivePanel .tg input:checked+i{background:${ACC}}
      #subLivePanel .tg input:checked+i::after{left:1.6em}
      #subLivePanel .f{margin-top:.5em;padding-top:.8em;border-top:1px solid #ffffff1a}
      #subLiveAsk{position:absolute;inset:0;z-index:10;display:grid;place-items:center;border-radius:1.1em;background:#000a;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#fff;font-size:15px;line-height:1.4;font-family:inherit;animation:subLiveIn .2s}
      #subLiveAsk div{max-width:22em;margin:0 16px;padding:1.2em 1.6em;border-radius:1.1em;text-align:center;background:rgba(18,18,20,.97);border:1px solid ${ACC};box-shadow:0 0 0 .3em color-mix(in srgb,${ACC} 25%,transparent),0 1em 3em #000c}
      #subLiveAsk b{display:block;margin-bottom:.4em;font-size:1.15em;color:${ACC}}
      #subLiveAsk em{font-style:normal;font-weight:600;border-bottom:2px solid ${ACC}}
      @keyframes subLiveIn{from{opacity:0}}
      #subLivePanel .rs{display:flex;align-items:center;gap:.6em;padding:.65em 1em;border-radius:.7em;background:#ffffff0d;border:1px solid #ffffff1f;color:#fff;cursor:pointer;font:inherit}
      #subLivePanel .rs:hover{background:#ffffff1a}
      #subLivePanel .lkn{margin:.3em 0 .5em;padding:.6em .8em;border-radius:.6em;background:#ffffff0d;border:1px solid ${ACC};font-size:.9em}
      #subLivePanel .lkn[hidden]{display:none}
      #subLivePanel [inert]{opacity:.45}`;
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
    // The outline thickness can be typed as well as dragged (steps of 0.1)
    const range = (k, attrs) => `<input data-k="${k}" type="range" ${attrs}>` + (k === 'edgeW' ? `<input class="num" data-n="${k}" type="number" min=".1" max="15" step=".1">` : `<output data-o="${k}"></output>`);
    // The desktop browser cannot open the system colour dialog: an in-page picker instead (the hidden input holds the value)
    const color = k => desktop
      ? `<div class="cp"><input data-k="${k}" type="hidden"><button type="button" class="pk" title="Pick a color"></button><div class="pp" hidden><div class="sv"><i></i></div><input class="hu" type="range" min="0" max="360" step="1"></div></div>`
      : `<label class="sw"><input data-k="${k}" type="color">${svg(P.chev, 18)}</label>`;
    // The desktop browser draws no <datalist> popup: it gets its own suggestion list
    const MORE = ['Arial Black', 'Arial Narrow', 'Bahnschrift', 'Cambria', 'Candara', 'Constantia', 'Corbel', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Ink Free', 'Javanese Text', 'Lucida Console', 'Lucida Sans Unicode', 'Microsoft JhengHei', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe Print', 'Segoe Script', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka Text', 'Sylfaen', 'Yu Mincho', 'AngsanaUPC', 'Browallia New', 'BrowalliaUPC', 'Cordia New', 'CordiaUPC', 'EucrosiaUPC', 'FreesiaUPC', 'IrisUPC', 'JasmineUPC', 'KodchiasanUPC', 'LilyUPC', 'Book Antiqua', 'Bookman Old Style', 'Century Gothic', 'Century', 'Garamond', 'Rockwell', 'Gill Sans MT', 'Franklin Gothic Book', 'Perpetua', 'Tw Cen MT', 'Helvetica Neue', 'Arial Unicode MS', 'Menlo', 'Monaco', 'Optima', 'Futura', 'Avenir', 'Lucida Grande', 'DejaVu Sans', 'DejaVu Serif', 'DejaVu Sans Mono', 'Liberation Sans', 'Liberation Serif', 'Ubuntu', 'Noto Sans CJK JP', 'Noto Sans Mono', 'Roboto', 'Roboto Condensed', 'Roboto Mono', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Inter', 'Oswald', 'Raleway', 'Source Sans Pro', 'Source Sans 3', 'Nunito', 'Merriweather', 'PT Sans', 'Playfair Display', 'Fira Sans', 'Fira Code', 'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono', 'Bebas Neue', 'Anton', 'Kanit', 'Prompt', 'Sarabun', 'TH Sarabun New', 'THSarabunNew', 'Mitr', 'Niramit', 'Pridi', 'Taviraj', 'Trirong', 'K2D', 'Krub', 'Athiti', 'Chakra Petch', 'Maitree', 'Mali', 'Bai Jamjuree', 'Itim', 'Pattaya', 'Sriracha', 'Charm', 'Charmonman', 'KoHo', 'IBM Plex Sans', 'IBM Plex Sans Thai', 'IBM Plex Mono', 'Noto Serif Thai', 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Noto Color Emoji', 'Source Code Pro', 'Work Sans', 'Rubik', 'Quicksand', 'Barlow', 'Karla', 'Mulish', 'Cabin', 'Josefin Sans', 'Libre Baskerville', 'Lora', 'Crimson Text', 'EB Garamond', 'Cinzel', 'Comfortaa', 'Pacifico', 'Lobster', 'Dancing Script'];
    // The Windows and Office font set: the desktop browser cannot list fonts, so every name here is checked instead
    const WIN = ['Agency FB', 'Algerian', 'Angsana New', 'AngsanaUPC', 'Arial', 'Arial Rounded MT', 'Bahnschrift', 'Baskerville Old Face', 'Bauhaus 93', 'Bell MT', 'Berlin Sans FB', 'Bernard MT', 'Blackadder ITC', 'Bodoni MT', 'Bodoni MT Poster', 'Book Antiqua', 'Bookman Old Style', 'Bradley Hand ITC', 'Britannic', 'Broadway', 'Browallia New', 'BrowalliaUPC', 'Brush Script MT', 'Calibri', 'Californian FB', 'Calisto MT', 'Cambria', 'Candara', 'Cascadia Code', 'Cascadia Mono', 'Castellar', 'Centaur', 'Century', 'Century Gothic', 'Century Schoolbook', 'Chiller', 'Colonna MT', 'Comic Sans MS', 'Consolas', 'Constantia', 'Cooper', 'Copperplate Gothic', 'Corbel', 'Cordia New', 'CordiaUPC', 'Courier New', 'Curlz MT', 'DilleniaUPC', 'Dubai', 'Ebrima', 'Edwardian Script ITC', 'Elephant', 'Engravers MT', 'Eras ITC', 'EucrosiaUPC', 'Felix Titling', 'Footlight MT', 'Forte', 'Franklin Gothic', 'Franklin Gothic Book', 'FreesiaUPC', 'Freestyle Script', 'French Script MT', 'Gabriola', 'Gadugi', 'Garamond', 'Georgia', 'Gigi', 'Gill Sans', 'Gill Sans MT', 'Gloucester MT', 'Goudy Old Style', 'Goudy Stout', 'Haettenschweiler', 'Harlow Solid', 'Harrington', 'High Tower Text', 'Impact', 'Imprint MT Shadow', 'Informal Roman', 'Ink Free', 'Input Mono', 'IrisUPC', 'JasmineUPC', 'Javanese Text', 'Jokerman', 'Juice ITC', 'KodchiangUPC', 'Kristen ITC', 'Kunstler Script', 'Leelawadee', 'Leelawadee UI', 'LilyUPC', 'Lucida Bright', 'Lucida Calligraphy', 'Lucida Console', 'Lucida Fax', 'Lucida Handwriting', 'Lucida Sans', 'Lucida Sans Typewriter', 'Lucida Sans Unicode', 'Magneto', 'Maiandra GD', 'Malgun Gothic', 'Matura MT Script Capitals', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft JhengHei UI', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft Uighur', 'Microsoft YaHei', 'Microsoft YaHei UI', 'Microsoft Yi Baiti', 'MingLiU_HKSCS-ExtB', 'MingLiU_MSCS-ExtB', 'MingLiU-ExtB', 'Mistral', 'Modern No. 20', 'Mongolian Baiti', 'Monotype Corsiva', 'MS Gothic', 'MS PGothic', 'MS Reference Sans Serif', 'MS UI Gothic', 'MV Boli', 'Myanmar Text', 'Niagara Engraved', 'Niagara Solid', 'Nirmala Text', 'Nirmala UI', 'NSimSun', 'OCR A', 'Old English Text MT', 'Onyx', 'Palace Script MT', 'Palatino Linotype', 'Papyrus', 'Parchment', 'Perpetua', 'Perpetua Titling MT', 'Playbill', 'PMingLiU-ExtB', 'Poor Richard', 'Pristina', 'Rage', 'Ravie', 'Rockwell', 'Script MT', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Showcard Gothic', 'SimSun', 'SimSun-ExtB', 'SimSun-ExtG', 'Sitka Banner', 'Sitka Display', 'Sitka Heading', 'Sitka Small', 'Sitka Subheading', 'Sitka Text', 'Snap ITC', 'Stencil', 'Sylfaen', 'Tahoma', 'Tempus Sans ITC', 'Times New Roman', 'Trebuchet MS', 'Tw Cen MT', 'Ubuntu Mono', 'Unispace', 'Verdana', 'Viner Hand ITC', 'Vivaldi', 'Vladimir Script', 'Wide Latin', 'Yu Gothic', 'Yu Gothic UI'];
    const DESK = [...new Set(FONTS.concat(MORE, WIN, ['Leelawadee UI', 'Angsana New', 'Browallia New', 'Cordia New', 'DilleniaUPC', 'Noto Sans Thai', 'Malgun Gothic', 'Yu Gothic', 'Microsoft YaHei', 'Segoe UI Semibold', 'Bahnschrift']))];
    const fontControl = '<div class="fs"><input data-k="font" type="text"' + (desktop ? '' : ' list="subLiveFonts"') + ' placeholder="Default" autocomplete="off" spellcheck="false">' + svg(P.chev, 20) + (desktop ? '<div class="fl" hidden></div>' : '') + '</div>'
      + (desktop ? '' : '<datalist id="subLiveFonts">' + FONTS.filter(n => desktop || avail(n) !== false).map(n => `<option value="${n}">`).join('') + (noWeb ? '' : WEB.map(n => `<option value="${n}" label="${n} (web font)">`).join('')) + '</datalist>');

    const panel = document.createElement('div');
    panel.id = 'subLivePanel';
    panel.hidden = true;
    panel.innerHTML = '<div class="lkn" hidden></div>'
      + row('size', 'Size', '', range('size', 'min=.5 max=5 step=.05'))
      + row('font', 'Font', '<span data-fs></span>', fontControl)
      + row('drop', 'Text color', '', color('color'))
      + row('alpha', 'Background', 'Adjust background opacity', range('bg', 'min=0 max=1 step=.05'))
      + row('drop', 'Background color', '', color('bgColor'))
      + row('edge', 'Outline', 'Add an outline to improve readability', '<label class="tg"><input data-k="edge" type="checkbox"><i></i></label>')
      + row('weight', 'Outline thickness', 'Width of the outline in pixels', range('edgeW', 'min=.1 max=15 step=.1'))
      + row('pos', 'Position', 'Below 0 goes lower', range('pos', 'min=-10 max=40 step=.5'))
      // mpv's own setting, global to every ASS file: only the desktop client has it
      + (desktop ? row('font', 'Override ASS style', 'Use this style for ASS subtitles too (signs and effects may break)', '<label class="tg"><input data-k="assOv" type="checkbox"><i></i></label>') : '')
      + `<div class="f"><button class="rs" data-reset>${svg(P.reset, 20)}Reset to default</button></div>`;
    document.body.append(panel);

    // Slider fill and the number box beside it
    const paint = i => {
      if (i.type !== 'range') return;
      i.style.setProperty('--p', (i.value - i.min) / (i.max - i.min) * 100 + '%');
      const o = panel.querySelector(`[data-o="${i.dataset.k}"]`);
      if (o) o.textContent = i.dataset.k === 'size' || i.dataset.k === 'bg' ? Math.round(i.value * 100) : i.value;
      const n = panel.querySelector(`[data-n="${i.dataset.k}"]`);
      if (n && document.activeElement !== n) n.value = i.value;
    };
    // The thickness slider is inert while Outline is off
    const edgeUi = () => {
      const w = panel.querySelector('[data-k=edgeW]');
      w.disabled = !s.edge;
      panel.querySelector('[data-n=edgeW]').disabled = !s.edge;
      w.closest('.r').style.opacity = s.edge ? '' : '.45';
    };
    // Say whether the chosen font can actually be used in this browser
    const paintFont = () => {
      const el = panel.querySelector('[data-fs]');
      const n = s.font;
      let text = 'Player default', color = '';
      if (desktop) {
        const local = n ? avail(n) : null;
        text = !n ? 'Player default' : local ? 'Installed on this computer' : local === false ? 'Not detected on this computer, the default font may be used' : 'Must be installed on this computer';
        color = local ? '#6fd08c' : local === false ? '#ff8a8a' : '';
      } else if (n) {
        // A name that was requested from Google Fonts is a web font from then on, even though the browser can now render it
        if (n in web) {
          if (web[n] === true) text = 'Web font from Google Fonts';
          else if (web[n] === false) { text = 'Not found on this device or Google Fonts'; color = '#ff8a8a'; }
          else text = 'Looking up on Google Fonts…';
        } else {
          const local = avail(n);
          if (local) { text = 'Installed on this device'; color = '#6fd08c'; }
          else if (!family(n)) { text = 'Not found on this device or Google Fonts'; color = '#ff8a8a'; }
          else if (noWeb) { text = 'Not installed on this device'; color = '#ff8a8a'; }
          else text = local === null ? '' : 'Looking up on Google Fonts…';
        }
      }
      el.textContent = text;
      el.style.color = color;
    };
    refreshFont = paintFont;
    // Colour button shows the current colour (desktop picker)
    const tint = i => { const b = i.closest('.cp')?.querySelector('.pk'); if (b) b.style.background = hex(i.value, '#ffffff'); };
    const sync = () => panel.querySelectorAll('[data-k]').forEach(i => {
      i.type === 'checkbox' ? (i.checked = !!s[i.dataset.k]) : (i.value = s[i.dataset.k]);
      if (i.type === 'hidden') tint(i);
      paint(i);
    });
    sync();
    paintFont();
    edgeUi();
    panel.addEventListener('input', e => {
      const i = e.target, k = i.dataset.k;
      if (!k) return;
      // A typed colour counts only once it is a complete #rrggbb
      if (i.type === 'text' && k !== 'font' && !/^#[0-9a-f]{6}$/i.test(i.value)) return;
      s[k] = i.type === 'checkbox' ? +i.checked : i.type === 'range' ? +i.value : i.value;
      paint(i);
      if (k === 'font') paintFont();
      if (k === 'edge') edgeUi();
      if (k === 'assOv') { unforce = !s.assOv; lockUi(); }
      apply();
    });
    // In-page colour picker (desktop): saturation/brightness square plus a hue slider, writing into the hex box
    const toHex = (h, s, v) => '#' + [5, 3, 1].map(n => { const k = (n + h / 60) % 6; return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255).toString(16).padStart(2, '0'); }).join('');
    const toHsv = x => {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16) / 255), m = Math.max(r, g, b), d = m - Math.min(r, g, b);
      return [d ? (m === r ? ((g - b) / d + 6) % 6 : m === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 : 0, m ? d / m : 0, m];
    };
    const pick = (pp, h, s, v) => {
      pp._c = [h, s, v];
      pp.querySelector('.sv').style.cssText = `--h:${h};--x:${s * 100}%;--y:${(1 - v) * 100}%`;
      pp.querySelector('.hu').value = h;
      const i = pp.parentElement.querySelector('input[data-k]');
      i.value = toHex(h, s, v);
      tint(i);
      i.dispatchEvent(new Event('input', { bubbles: true }));
    };
    panel.addEventListener('pointerdown', e => {
      const sv = e.target.closest('.sv');
      if (!sv) return;
      const move = ev => { const r = sv.getBoundingClientRect(), pp = sv.parentElement; pick(pp, pp._c[0], Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), 1 - Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height))); };
      sv.setPointerCapture(e.pointerId);
      sv.onpointermove = move;
      sv.onpointerup = () => { sv.onpointermove = sv.onpointerup = null; };
      move(e);
    });
    panel.addEventListener('input', e => {
      const n = e.target.closest('[data-n]');
      if (n && n.value !== '' && Number.isFinite(+n.value)) {
        const r = panel.querySelector(`[data-k="${n.dataset.n}"]`);
        r.value = Math.min(+r.max, Math.max(+r.min, +n.value));
        r.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      const hu = e.target.closest('.hu');
      if (hu) pick(hu.parentElement, +hu.value, hu.parentElement._c[1], hu.parentElement._c[2]);
    });
    panel.addEventListener('click', e => {
      const pk = e.target.closest('.pk');
      if (pk) {
        const pp = pk.closest('.cp').querySelector('.pp'), i = pk.closest('.cp').querySelector('input[data-k]');
        panel.querySelectorAll('.pp').forEach(o => { if (o !== pp) o.hidden = true; });
        pp.hidden = !pp.hidden;
        if (!pp.hidden) {
          const [h, s, v] = toHsv(hex(i.value, '#ffffff'));
          // Show the current colour without rewriting it: pick() would round-trip it through HSV
          pp._c = [h, s, v];
          pp.querySelector('.sv').style.cssText = `--h:${h};--x:${s * 100}%;--y:${(1 - v) * 100}%`;
          pp.querySelector('.hu').value = h;
        }
        return;
      }
    });
    // Keys typed in the panel must not reach the player's shortcuts (for example G and H move the subtitle offset)
    ['keydown', 'keyup', 'keypress'].forEach(ev => panel.addEventListener(ev, e => {
      if (ev === 'keydown' && e.key === 'Escape') panel.hidden = true;
      e.stopPropagation();
      // Something earlier (the player's G/H shortcuts, another plugin) can cancel the key before the box gets it: type it ourselves
      const i = e.target;
      if (ev === 'keydown' && e.defaultPrevented && i.type === 'text' && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        i.setRangeText(e.key, i.selectionStart, i.selectionEnd, 'end');
        i.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }));
    panel.querySelector('[data-reset]').onclick = () => { s = { ...D, assOv: s.assOv }; sync(); paintFont(); edgeUi(); apply(); };

    // ASS and image subtitles are drawn by their own renderers (libass / libbitsub on the web, mpv on desktop): the style
    // cannot reach them, so the panel is locked while one plays. The server says which subtitle stream this device plays.
    const LOCK = { ass: 'ass', ssa: 'ass', pgssub: 'img', dvdsub: 'img', dvbsub: 'img', vobsub: 'img' };
    let kind = '';
    const lockUi = () => {
      const locked = kind === 'img' || (kind === 'ass' && !(desktop && s.assOv));
      const note = panel.querySelector('.lkn');
      note.hidden = !locked;
      note.textContent = kind === 'img' ? 'Image subtitle (PGS / DVD): it cannot be restyled.'
        : desktop ? 'ASS subtitle: styled by the file. Turn on Override ASS style below to restyle it.'
        : 'ASS subtitle: styled by the file. Only Jellyfin Desktop can override it.';
      // Fails open: unknown or plain text subtitles leave the panel as it is
      panel.querySelectorAll('.r, .f').forEach(r => { if (r.querySelector('[data-k]:not([data-k=assOv]), [data-reset]')) r.inert = locked; });
    };
    const probe = async () => {
      try {
        const a = window.ApiClient;
        const [ses] = await a.getSessions({ deviceId: a.deviceId() });
        const i = ses.PlayState.SubtitleStreamIndex;
        const st = ses.NowPlayingItem.MediaStreams.find(m => m.Type === 'Subtitle' && m.Index === i);
        kind = LOCK[String(st?.Codec).toLowerCase()] || '';
      } catch { kind = ''; }
      lockUi();
    };
    // Rechecked while the panel is open, so a track switch is seen
    setInterval(() => { if (!panel.hidden) probe(); }, 2000);

    let addPool = () => {};
    if (desktop) {
      const fi = panel.querySelector('input[data-k=font]'), fl = panel.querySelector('.fl');
      // Only fonts this computer really has: the candidate names are checked, and the full installed list is added when the browser can give it
      const pool = new Set(DESK.filter(n => avail(n) !== false));
      const show = () => {
        const q = pool.has(fi.value) ? '' : fi.value.toLowerCase();
        fl.innerHTML = [...pool].sort((x, y) => x.localeCompare(y)).filter(n => n.toLowerCase().includes(q)).map(n => `<button type="button" data-f="${n}" style="font-family:'${n}',sans-serif">${n}</button>`).join('');
        fl.hidden = !fl.firstChild;
      };
      addPool = n => pool.add(n);
      fi.addEventListener('focus', show);
      fi.addEventListener('input', () => { if (/^[A-Za-z0-9][A-Za-z0-9 ]{0,40}$/.test(fi.value) && avail(fi.value)) pool.add(fi.value); show(); });
      fi.addEventListener('blur', () => { fl.hidden = true; });
      // mousedown, not click: the input must not lose focus first
      fl.addEventListener('mousedown', e => {
        const b = e.target.closest('[data-f]');
        if (!b) return;
        e.preventDefault();
        fi.value = b.dataset.f;
        fi.dispatchEvent(new Event('input', { bubbles: true }));
        fl.hidden = true;
      });
    }

    // Chrome can list the fonts really installed on this device (asks permission): fills the suggestions with exact names
    let loaded = false, pending = false;
    panel.querySelector('input[data-k=font]').addEventListener('focus', async () => {
      if (pending || !window.queryLocalFonts) return;
      pending = true;
      const st = await navigator.permissions?.query({ name: 'local-fonts' }).then(p => p.state, () => 'prompt') || 'prompt';
      if (st !== 'granted') loaded = false;   // permission reset or never given: ask again
      if (loaded || st === 'denied') { pending = false; return; }
      // dim + blur the panel (a child of it, so it follows the panel when it is closed and reopened) while the browser prompt (top-left) is open
      let ask;
      if (st === 'prompt') {
        ask = document.createElement('div');
        ask.id = 'subLiveAsk';
        ask.innerHTML = '<div><b>&#8598; Click Allow</b>Your browser is asking to list the fonts installed on this device. Press <em>Allow</em> in the box at the top-left so Live Subtitle Style can show your fonts.</div>';
        panel.scrollTop = 0;
        panel.style.overflow = 'hidden';
        panel.append(ask);
      }
      window.queryLocalFonts().then(list => {
        loaded = true;
        const list_ = panel.querySelector('#subLiveFonts');
        const names = [...new Set(list.map(f => f.family))].sort();
        if (desktop) { names.forEach(n => addPool(n)); return; }
        const have = new Set([...list_.options].map(o => o.value));
        names.forEach(n => {
          if (have.has(n)) return;
          const o = document.createElement('option');
          o.value = n;
          list_.append(o);
        });
      }).catch(() => {}).finally(() => { pending = false; ask?.remove(); panel.style.overflow = ''; });
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
          lockUi();
          probe();
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
