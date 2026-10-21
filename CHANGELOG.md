# Changelog

## 1.1.2.0
- The font suggestions now list only fonts this browser can actually use (installed system fonts, plus the Google web fonts), so a font that cannot be rendered is no longer offered.

## 1.1.1.0
- The Font row now says whether the chosen font can be used in the browser you are watching in: green 'Installed on this device', red 'Not available in this browser, default font used', or 'Web font from Google Fonts'. Browsers with font-fingerprint protection (for example Brave Shields, Firefox with resistFingerprinting) hide installed fonts, in which case use a web font.

## 1.1.0.0
- Redesigned subtitle style popup: header, icon tiles, red sliders with value boxes, toggle switch, font dropdown, colour swatches and a Reset button. The OSD button is now an 'Aa' glyph. The font box can list the fonts actually installed on the device (Chrome asks permission once), and Thai serif web fonts close to Angsana and Dillenia were added (Noto Serif Thai, Trirong, Taviraj, Pridi).

## 1.0.9.0
- Added Google Fonts with Thai support (Sarabun, Mitr, Prompt, Kanit, Noto Sans Thai), listed as web fonts in the font field. A font is fetched from Google Fonts only when you select it, so it works on devices without the Windows Thai fonts.

## 1.0.8.0
- The font control is now a type-in field with suggestions, so any font installed on the viewing device can be used. Thai fonts (Angsana New, AngsanaUPC, DilleniaUPC, Cordia New, Browallia New, TH Sarabun New, Leelawadee UI) are listed first.

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
