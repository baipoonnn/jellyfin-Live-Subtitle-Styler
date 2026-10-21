# Changelog

## 1.3.13.0
- When the browser asks permission to list installed fonts, the styler panel is dimmed and blurred behind a message telling you to press Allow (matches the theme color). It goes away once you answer, or when you click it.

## 1.3.12.0
- Outline thickness limit raised from 6 to 15.

## 1.3.11.0
- Outline thickness can be typed as well as dragged, in steps of 0.1 (0.1 to 6). On the desktop client it is sent to mpv as a decimal sub-border-size, 1:1 instead of doubled, so it no longer looks much thicker than in the browser.

## 1.3.10.0
- Jellyfin Desktop: the font list checks the whole Windows and Office font set (about 380 names) and shows only the fonts the computer can render, in alphabetical order.

## 1.3.9.0
- A key that something else cancels before the font box gets it (G, for example) is now typed anyway. Desktop: about 190 common font names are checked, and a typed font that is installed is added to the list.

## 1.3.8.0
- Jellyfin Desktop: the font list now shows only fonts installed on the computer (common names are checked, and the full installed list is added when the browser provides it). The status line says whether the typed font was found.

## 1.3.7.0
- Keys typed in the style panel (for example G in the font box) no longer reach the player's keyboard shortcuts.

## 1.3.6.0
- Jellyfin Desktop: colour rows now show only the picker button (current colour); the hex box and preset swatches are removed.

## 1.3.5.0
- Jellyfin Desktop: added an in-page colour picker (saturation/brightness square and hue slider) beside the hex box and swatches.

## 1.3.4.0
- Jellyfin Desktop: the font box shows its own clickable suggestion list, because the desktop browser draws no datalist popup.

## 1.3.3.0
- Jellyfin Desktop: subtitle changes now apply while a slider is being dragged, not only after the mouse is released.

## 1.3.2.0
- Jellyfin Desktop: the colour pickers now use a hex box with preset swatches, because the desktop browser cannot open the system colour dialog.

## 1.3.1.0
- Jellyfin Desktop: the font box now suggests common system fonts and says the font must be installed on the computer, instead of running browser font checks and Google Fonts lookups that do not apply to mpv.

## 1.3.0.0
- Jellyfin Desktop support: in the desktop client (mpv playback) the Aa panel now restyles subtitles live through the client's own subtitle settings and manual mpv config (size, font, colors, background box, outline, position).

## 1.2.1.0
- Security hardening: values read back from browser storage are now clamped and validated before they reach the stylesheet. Added an opt-out for all Google Fonts requests (localStorage.subLiveNoWeb = '1'). README shortened and a security and privacy section added.

## 1.2.0.0
- Made the font handling language-neutral. The suggestions are now common system fonts plus general Google web fonts. Any font name you type that is not installed is looked up on Google Fonts after a short pause (letters, digits and spaces only). The installed-font check uses sample text from ten scripts, and a font loaded from Google Fonts is reported as a web font instead of 'Installed on this device'.

## 1.1.7.0
- Fixed two Aa buttons appearing. The WebGPU Player inserts its tune button next to the gear after this button is added, so the check 'is my button right before the gear' failed and a second button was added. The check now looks at the whole button row.

## 1.1.6.0
- Fixed the Aa button sometimes missing after switching movie or episode. Jellyfin keeps more than one copy of the OSD button row and rebuilds them on each playback, but the script looked for a single button and could leave the visible row without one. It now puts a button next to every gear that lacks one.

## 1.1.5.0
- Removed the header (badge, title and subtitle) from the popup; it now starts directly with the settings. Shorter Position hint.

## 1.1.4.0
- Added an Outline thickness slider (0.5 to 6 px) under the Outline toggle; it is inactive while Outline is off. The Size limit was raised from 300% to 500%.

## 1.1.3.0
- Position can now go below 0 (down to -10) so subtitles can sit lower than the bottom edge; some fonts have tall line boxes and stayed high at 0. The stock margin under the subtitle is reset so this slider is the only vertical control.

## 1.1.2.0
- The font suggestions now list only fonts this browser can actually use (installed system fonts, plus the Google web fonts), so a font that cannot be rendered is no longer offered.

## 1.1.1.0
- The Font row now says whether the chosen font can be used in the browser you are watching in: green 'Installed on this device', red 'Not available in this browser, default font used', or 'Web font from Google Fonts'. Browsers with font-fingerprint protection (for example Brave Shields, Firefox with resistFingerprinting) hide installed fonts, in which case use a web font.

## 1.1.0.0
- Redesigned subtitle style popup: icon tiles, red sliders with value boxes, toggle switch, font dropdown, colour swatches and a Reset button. The OSD button is now an 'Aa' glyph. The font box can list the fonts actually installed on the device (Chrome asks permission once) and offers more web fonts.

## 1.0.9.0
- Added Google Fonts as web fonts in the font field. A font is fetched from Google Fonts only when you select it, so it works on devices that do not have the font installed.

## 1.0.8.0
- The font control is a type-in field with suggestions, so any font installed on the viewing device works.

## 1.0.7.0
- The full version history now appears in Dashboard > Plugins.

## 1.0.6.0
- Added a font selector (12 common fonts) to the subtitle style popup; it applies live.
- Changed the OSD button icon to an "Aa" glyph so it no longer looks like the subtitle track picker.

## 1.0.5.0
- Fixed the plugin corrupting the video player. File Transformation matched `index.html` as a regex, which also matched `playback-video-index-html.<hash>.chunk.js`, and a `<script>` tag was appended to that JavaScript chunk. The OSD and keyboard controls disappeared.
- The callback now only modifies markup (content that starts with `<`) and returns everything else untouched.

## 1.0.4.0
- Markup guard ignores a leading BOM and whitespace.

## 1.0.3.0
- Tried an escaped `index\.html` pattern; File Transformation did not match it, so nothing was injected. Reverted in 1.0.5.0.

## 1.0.2.0
- Anchored pattern and doctype guard. Neither injected the script. Superseded by 1.0.5.0.

## 1.0.1.0
- The script starts after the page has fully loaded.
- The OSD button is a clone of the gear button instead of a new custom element.
- Removed the `history.pushState` wrapper; a throttled observer mounts the button when the OSD appears.
- Kill switch: set `localStorage.subLiveOff = '1'` to disable the script in that browser.

## 1.0.0.0
- First release. Subtitle style popup with live size, color, background, outline and position controls, saved in the browser. Injected into `index.html` through the File Transformation plugin.
