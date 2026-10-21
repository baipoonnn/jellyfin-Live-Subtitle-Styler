<div align="center">

# Jellyfin Live Subtitle Styler

**Style subtitles in the Jellyfin web player while the video keeps playing.**

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbaipoonnn%2Fjellyfin-Live-Subtitle-Styler%2Fmain%2Fmanifest.json&query=%24%5B0%5D.versions%5B0%5D.version&label=version&color=e50914)](CHANGELOG.md)
[![Jellyfin](https://img.shields.io/badge/Jellyfin-12.1%2B-00a4dc)](https://jellyfin.org)

<img src="images/preview.png" alt="The subtitle style popup open above the Jellyfin player controls" width="820">

<sub>Rendered with the plugin's real script on a mock player.</sub>

</div>

## About

Adds an **Aa** button next to the gear in the Jellyfin web player. It opens a popup where size, font, colors, outline and position change the subtitle on screen **instantly**, with no playback restart. Choices are remembered in the browser.

## Install

Requires Jellyfin **12.1+** and the [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) plugin. Works in the web client only.

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

## Security and privacy

- **No tracking, no accounts.** The script makes no requests to your server or anyone else, except Google Fonts (below). It never reads Jellyfin's API, your login, cookies or tokens.
- **Local storage only.** Your choices are kept in one browser `localStorage` entry. Stored values are validated before use.
- **Google Fonts.** A font name you type that is not installed (letters, digits and spaces only) is requested from `fonts.googleapis.com`, which sees your IP and that name. Installed fonts and all other settings never leave the browser. To turn this off, run `localStorage.subLiveNoWeb = '1'` in the browser console.
- **Server side.** The plugin is a tiny DLL that registers one callback with File Transformation and adds the script to `index.html`. It has no endpoints, no network or file access, and never touches your users or library.
- **Trust.** Like any Jellyfin plugin it runs with the server's permissions, and the script runs for everyone who opens the web client. The source is in this repo; release zips in `dist/` are built from it and listed with MD5 checksums in `manifest.json`.

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
