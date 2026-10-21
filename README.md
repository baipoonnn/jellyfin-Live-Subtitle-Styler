<div align="center">

# Jellyfin Live Subtitle Styler

**Style subtitles in the Jellyfin web player and desktop client while the video keeps playing.**

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbaipoonnn%2Fjellyfin-Live-Subtitle-Styler%2Fmain%2Fmanifest.json&query=%24%5B0%5D.versions%5B0%5D.version&label=version&color=e50914)](CHANGELOG.md)
[![Jellyfin](https://img.shields.io/badge/Jellyfin-12.1%2B-00a4dc)](https://jellyfin.org)

<img src="images/preview.png" alt="The subtitle style popup open above the Jellyfin player controls" width="820">

<sub>Rendered with the plugin's real script on a mock player.</sub>

</div>

## About

Adds an **Aa** button next to the gear in the Jellyfin web player. It opens a popup where size, font, colors, outline and position change the subtitle on screen **instantly**, with no playback restart. Choices are remembered in the browser.

## Install

Requires Jellyfin **12.1+** and the [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) plugin. Works in the web client and in [Jellyfin Desktop](https://github.com/jellyfin/jellyfin-desktop) (it loads the server's web client).

1. **Dashboard > Plugins > Repositories > +**, add:
   ```
   https://raw.githubusercontent.com/baipoonnn/jellyfin-Live-Subtitle-Styler/main/manifest.json
   ```
2. Install **Live Subtitle Style** from the Catalog and restart Jellyfin.
3. Hard refresh the browser (Ctrl+F5), play a video with a text subtitle, and click **Aa**.

## Settings

| Setting | Range | Default |
| --- | --- | --- |
| Size | 50% to 500% | 100% |
| Font | installed font or Google Fonts family | player default |
| Text color / Background color | any | white / black |
| Background opacity | 0 to 100 | 0 |
| Outline / Outline thickness | on, 0.5 to 6 px | on, 1.5 px |
| Position | -10 to 40 (% from the bottom; below 0 goes lower than the edge) | 8 |

Only text subtitles (SRT, WebVTT) are restyled. ASS/SSA and PGS keep their own styling.

## Fonts

Type any font name. Only fonts your browser can really use are suggested. If a font is not installed, it is looked up on [Google Fonts](https://fonts.google.com) (a few popular ones are suggested), so it works on any device. A status line under the font says which case applies.

## Jellyfin Desktop

The desktop client plays with mpv, which draws subtitles itself. There the Aa panel writes to the client's own subtitle settings (size, font, colors, outline) and to a marked `# subLive` block in **Manual MPV Configuration** (position, background box). Differences from the web player: the font must be installed on the computer (no Google Fonts), outline thickness is rounded to whole steps, and a background above 0 turns on mpv's box style. The first change in a session overwrites the client's subtitle settings; nothing is changed before that.

## Troubleshooting

- **Installed fonts are missing, or the status is red.** The browser is hiding them. In Brave set Shields > Advanced View > **Block fingerprinting** to Disabled for the site; in Firefox turn off `privacy.resistFingerprinting`. Google Fonts work either way.
- **Subtitle does not change.** It must be an SRT or WebVTT track.
- **No Aa button.** Hard refresh, and check the plugin is Active and File Transformation is installed.
- **Switch it off in one browser.** `localStorage.subLiveOff = '1'`, then refresh.

## Build

```
dotnet publish Jellyfin.Plugin.LiveSubtitleStyle -c Release -o out
```

Zip the DLL into `dist/` and add a version with its MD5 checksum at the top of `manifest.json`. Version history: [CHANGELOG.md](CHANGELOG.md).

## License

No license chosen yet, so all rights are reserved. Add a `LICENSE` file (for example MIT) to let others use and modify it.
