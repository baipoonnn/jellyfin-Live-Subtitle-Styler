# Changelog

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
