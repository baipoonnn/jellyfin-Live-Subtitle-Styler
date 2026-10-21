<div align="center">

# Jellyfin Live Subtitle Styler

**Style subtitles in the Jellyfin web player while the video keeps playing.**

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbaipoonnn%2Fjellyfin-Live-Subtitle-Styler%2Fmain%2Fmanifest.json&query=%24%5B0%5D.versions%5B0%5D.version&label=version&color=e50914)](CHANGELOG.md)
[![Jellyfin](https://img.shields.io/badge/Jellyfin-12.1%2B-00a4dc)](https://jellyfin.org)
[![Client](https://img.shields.io/badge/client-web-informational)](#requirements)
[![Last commit](https://img.shields.io/github/last-commit/baipoonnn/jellyfin-Live-Subtitle-Styler)](https://github.com/baipoonnn/jellyfin-Live-Subtitle-Styler/commits/main)

<img src="images/preview.png" alt="The subtitle style popup open above the Jellyfin player controls" width="860">

<sub>Rendered with the plugin's real script on a mock player.</sub>

</div>

## Table of contents

- [About](#about)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Settings](#settings)
- [Fonts and Thai subtitles](#fonts-and-thai-subtitles)
- [Troubleshooting](#troubleshooting)
- [Compatibility](#compatibility)
- [Building from source](#building-from-source)
- [Changelog](#changelog)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## About

Jellyfin's own subtitle appearance settings live on a separate page, so tuning them means leaving the video. This plugin adds an **Aa** button to the player controls, next to the gear. It opens a small popup where every change is applied to the subtitle on screen **instantly**, with no restart of playback. Your choices are remembered in the browser.

## Features

- **Live updates.** Size, font, colors, outline and position change the moment you move a control.
- **Thai-friendly.** A **Position** control that goes below the edge of the screen, an outline you can thicken, a font box that lists only fonts your browser can use, and Thai web fonts that work on any device.
- **Looks native.** The button is a clone of the player's gear button, so your theme styles it. The popup follows your theme's accent color.
- **Light.** One small script, one stylesheet rewrite per change, nothing running while you watch.
- **Safe.** Anything that goes wrong stays inside the script, and a one-line switch turns it off in a browser.

<p align="center">
  <img src="images/popup.png" alt="The subtitle style popup" width="360">
</p>

## Requirements

| What | Version |
| --- | --- |
| Jellyfin server | 12.1 or later |
| [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) plugin | installed and active |
| Client | the Jellyfin **web** client in a browser |

The Jellyfin apps for phones and TVs do not load web plugins, so they are not affected.

## Installation

1. In Jellyfin open **Dashboard > Plugins > Repositories** and click **+**. Add:

   ```
   https://raw.githubusercontent.com/baipoonnn/jellyfin-Live-Subtitle-Styler/main/manifest.json
   ```

2. Open the **Catalog**, find **Live Subtitle Style** and install it.
3. Restart Jellyfin.
4. In your browser do a hard refresh (**Ctrl+F5**).

Every released version, with its notes, is listed under **Revision History** on the plugin's page.

## Usage

1. Play a video that has a **text** subtitle (SRT or WebVTT) turned on.
2. Click the **Aa** button next to the gear in the player controls.
3. Change anything in the popup; the subtitle updates as you go.
4. Click outside the popup or press **Esc** to close it.

**Reset to default** at the bottom puts every setting back.

## Settings

| Setting | Range | Default | Notes |
| --- | --- | --- | --- |
| Size | 50% to 500% | 100% | Thai fonts render small; try 150% or more |
| Font | any usable font | player default | A status line says whether the font can be used |
| Text color | any | white | |
| Background | 0 to 100 | 0 | Opacity of the box behind the text |
| Background color | any | black | |
| Outline | on / off | on | |
| Outline thickness | 0.5 to 6 px | 1.5 px | Inactive while Outline is off |
| Position | -10 to 40 | 8 | Percent of the screen height from the bottom. Below 0 goes lower than the edge |

## Fonts and Thai subtitles

The **Font** box is a type-in field with suggestions.

- **System fonts.** Only fonts your browser can really use are suggested, so a font that cannot be shown is never offered. You can still type any font name.
- **Installed font list.** Chrome-based browsers can list every installed font after a one-time permission prompt ("Look up fonts on this device"). The exact names are then added to the suggestions.
- **Web fonts.** These work on any device and are fetched from Google Fonts only when you pick one:

  | Style | Fonts |
  | --- | --- |
  | Sans-serif | Sarabun, Mitr, Prompt, Kanit, Noto Sans Thai |
  | Serif (closest free look to Angsana New and Dillenia) | Noto Serif Thai, Trirong, Taviraj, Pridi |

- **Status line.** Under the font name it shows green *Installed on this device*, *Web font from Google Fonts*, or red *Not available in this browser*.

## Troubleshooting

**Windows fonts such as Angsana New or DilleniaUPC are missing, or the status is red.**
The browser is hiding installed fonts.

- **Brave:** click the lion icon on the Jellyfin page, open *Advanced View*, and set **Block fingerprinting** to *Disabled* (or *Standard*) for that site.
- **Firefox:** turn off `privacy.resistFingerprinting`.
- The font must also be installed on the device you watch from. Phones and TVs usually lack Windows fonts.
- The web fonts above work in every browser.

**The subtitle does not change.**
It must be a text subtitle (SRT or WebVTT). ASS/SSA and PGS tracks carry their own styling and are not restyled.

**The Aa button is missing.**
Do a hard refresh (Ctrl+F5). Check that the plugin shows as **Active** and that File Transformation is installed. A theme or plugin that renames the player's gear button (`btnVideoOsdSettings`) can also hide it; please open an issue with the theme name.

**Turn the script off in one browser.**
Run `localStorage.subLiveOff = '1'` in the browser console and refresh. Run `localStorage.removeItem('subLiveOff')` to turn it back on.

## Compatibility

- Works with the stock web player and with the [WebGPU Player](https://github.com/alchemyyy/jellyfin-plugin-webgpu-player) plugin.
- Developed and tested with the Netflin theme on Jellyfin 12.2. Other themes should work because the button copies the player's own, but they are untested.

## Building from source

Requires the .NET 10 SDK.

```
dotnet publish Jellyfin.Plugin.LiveSubtitleStyle -c Release -o out
```

To publish a version: zip `Jellyfin.Plugin.LiveSubtitleStyle.dll`, put the zip in `dist/`, and add an entry with its MD5 checksum at the top of `manifest.json`. Jellyfin rejects a zip whose MD5 differs from the manifest's `checksum`, and it caches the manifest for a few minutes, so a new version can take a little while to show in the catalog.

How it works: the plugin registers an `index.html` callback with File Transformation and appends one script to the page. The callback only edits markup and returns anything else unchanged, because the pattern also matches the player's JavaScript chunk `playback-video-index-html.<hash>.chunk.js`.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Acknowledgements

- [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) by IAmParadox27, used to add the script to the web client.
- [Jellyfin](https://jellyfin.org) and its [plugin template](https://github.com/jellyfin/jellyfin-plugin-template).

## License

No license has been chosen yet, so all rights are reserved by default. Add a `LICENSE` file (for example MIT) to allow others to use and modify the code.
