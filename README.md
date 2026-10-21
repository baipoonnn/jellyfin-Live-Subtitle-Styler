# Jellyfin Live Subtitle Styler

Adds a **subtitle style** button (an "Aa" icon) next to the gear in the Jellyfin web player. It opens a popup where size, font, colors, outline and position change **live**, with no playback restart. Settings are saved per browser.

## Features

- **Size** (50% to 500%), **text color**, **background opacity**, **background color**, **outline**, **outline thickness** (0.5 to 6 px) and **position**, all applied instantly.
- **Position** goes below 0 (down to -10), so subtitles can sit lower than the bottom edge. Useful for Thai fonts, which have tall line boxes.
- **Font** field with a list of suggestions:
  - Only fonts your browser can really use are listed (installed system fonts), so a font that cannot be rendered is not offered.
  - **Web fonts** with Thai glyphs work on any device and are fetched from Google Fonts only when you select one: Sarabun, Mitr, Prompt, Kanit, Noto Sans Thai, and the Thai serif fonts Noto Serif Thai, Trirong, Taviraj and Pridi (the closest free look to Angsana New and Dillenia).
  - Chrome can list every installed font after a one-time permission prompt ("Look up fonts on this device"); the exact names are then added to the list. You can also type any installed font name.
  - A status line under the font says whether the chosen font is installed, a web font, or not available in this browser.
- Works with the stock player and the [WebGPU Player](https://github.com/alchemyyy/jellyfin-plugin-webgpu-player) plugin.

Text subtitles (SRT, WebVTT) are restyled. ASS/SSA and PGS carry their own styling and are not affected.

## Requirements

- Jellyfin 12.1 or later.
- The [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) plugin. This plugin injects its script into `index.html` through it.

## Install

1. In Jellyfin go to **Dashboard > Plugins > Repositories > +** and add:

   ```
   https://raw.githubusercontent.com/baipoonnn/jellyfin-Live-Subtitle-Styler/main/manifest.json
   ```

2. Open the **Catalog**, install **Live Subtitle Style**, then restart Jellyfin.
3. Hard refresh the browser (Ctrl+F5), play a video, and click the **Aa** button next to the gear.

Every released version is listed under **Revision History** on the plugin's page, with its notes.

## Troubleshooting

**Windows fonts such as Angsana New or DilleniaUPC are not listed, or the status says "Not available in this browser".**
The browser is hiding installed fonts. Brave does this with Shields: click the lion icon on the Jellyfin page, open Advanced View, and set **Block fingerprinting** to Disabled (or Standard) for that site. Firefox does it with `privacy.resistFingerprinting`. Also check that the font is installed on the device you watch from; phones and TVs usually lack Windows fonts. The web fonts work either way.

**The subtitle does not change.**
It must be a text subtitle (SRT or WebVTT). ASS/SSA and PGS tracks are not restyled.

**Turn the script off in one browser.**
Run `localStorage.subLiveOff = '1'` in the browser console and refresh. Run `localStorage.removeItem('subLiveOff')` to turn it back on.

## Build

```
dotnet publish Jellyfin.Plugin.LiveSubtitleStyle -c Release -o out
```

Zip `Jellyfin.Plugin.LiveSubtitleStyle.dll`, put the zip in `dist/`, and add a version entry (with its MD5 checksum) at the top of `manifest.json`. Jellyfin rejects a zip whose MD5 differs from the manifest's `checksum`, and it caches the manifest for a few minutes, so a new version can take a little while to appear in the catalog.

The plugin registers an `index.html` callback with File Transformation. The callback only modifies markup and returns anything else unchanged, because the pattern also matches the player's JavaScript chunk `playback-video-index-html.<hash>.chunk.js`.

See [CHANGELOG.md](CHANGELOG.md) for the version history.
