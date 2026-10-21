# Jellyfin Live Subtitle Styler

Adds a **subtitle style** button (an "Aa" icon) next to the gear in the Jellyfin web player. Size, font, color, background, outline and position change **live**, with no playback restart. Settings are saved per browser.

- Works for text subtitles (SRT, WebVTT). ASS/SSA and PGS carry their own styling and are not affected.
- The font field accepts any font installed on the device you watch from, for example Thai fonts such as *Angsana New* or *DilleniaUPC*. Thai fonts render small, so raise Size.
- Works with the stock player and the [WebGPU Player](https://github.com/alchemyyy/jellyfin-plugin-webgpu-player) plugin.

## Requirements

- Jellyfin 12.1 or later.
- The [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) plugin. This plugin injects its script into `index.html` through it.

## Install

1. In Jellyfin go to **Dashboard > Plugins > Repositories > +** and add:

   ```
   https://raw.githubusercontent.com/baipoonnn/jellyfin-Live-Subtitle-Styler/main/manifest.json
   ```

2. Open the **Catalog**, install **Live Subtitle Style**, then restart Jellyfin.
3. Hard refresh the browser (Ctrl+F5).

## Troubleshooting

Run `localStorage.subLiveOff = '1'` in the browser console and refresh to turn the script off in that browser.

## Build

```
dotnet publish Jellyfin.Plugin.LiveSubtitleStyle -c Release -o out
```

Zip `Jellyfin.Plugin.LiveSubtitleStyle.dll`, put the zip in `dist/`, and add a version entry (with its MD5 checksum) to `manifest.json`. Jellyfin rejects a zip whose MD5 differs from the manifest's `checksum`.

See [CHANGELOG.md](CHANGELOG.md) for the version history.
