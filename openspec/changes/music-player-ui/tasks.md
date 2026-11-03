# Tasks

## 1. Cover and queue index

- [ ] 1.1 Add `src/music/cover.ts` exporting `coverFromTitle`, returning the first character of the first two words uppercased, or the first two characters of a single word, and a background from a fixed palette chosen by a hash of the title, and verify `src/music/cover.test.ts` passes `npm test` for two-word initials, one-word initials, the same title always returning the same color, and no Spotify green (`#1db954`) in the palette
- [ ] 1.2 Add `playAtIndex` to `src/music/queue.ts` so a later index returns the same `trackIds` with that index and does not reshuffle, and verify `src/music/queue.test.ts` passes `npm test` for playing the second of three ids through the rest of that same list, including a list that is already shuffled, while `startAtTrack` is unchanged

## 2. Hidden engine and surface state

- [ ] 2.1 Add `nowPlayingOpen` and `queueOpen` to `src/music/MusicProvider.tsx`, plus open, close, and `playAtIndex` actions that keep the current `trackIds`, and verify both flags reset when the session is cleared, closing either surface does not pause, and a **Next** row uses `playAtIndex` rather than `startAtTrack`
- [ ] 2.2 Replace the visible frame in `src/music/PlayerBar.tsx` with an `AudioEngine` host that stays mounted while `session !== null`, clipped out of the layout with a non-zero box (`position: absolute` and a clip, not `display: none` and not `width: 0; height: 0`), `aria-hidden`, with nothing painted over it, keeping `controls: 0`, `rel: 0`, `playsinline: 1`, and `origin` set to `window.location.origin`, and verify `src/pages/MusicPage.test.tsx` still passes `npm test` for the official iframe API and no ad slot, the engine source shows the unavailable alert when `loadYouTubeIframeApi` rejects, and the engine source contains no `.player-frame`, no youtube-dl, no yt-dlp, no Invidious, no Piped, and no skip-ad control

## 3. Mini player

- [ ] 3.1 Add `MiniPlayer` and mount it from `src/shell/AppShell.tsx` only while a session exists, with a separate play/pause button that does not open now playing and a bar control that does, one-line ellipsis for the title and playlist name, a small square from `coverFromTitle`, and an `aria-hidden` progress strip that does not call `seekTo`, and verify a static render shows the bar absent when there is no session, Pause while playing and Play while paused, no `iframe`, and no `.player-frame`
- [ ] 3.2 Remove the third `.shell` grid row and the `.player-bar` / `.player-frame` rules from `src/index.css`, fix the bar to the bottom of the content column above `48rem` and full width at `48rem` and below with `padding-bottom: env(safe-area-inset-bottom)`, and pad `main` only while the bar is mounted, and verify the stylesheet has no `.player-frame` and no reserved player row when `data-player` is false

## 4. Now playing

- [ ] 4.1 Add `NowPlaying` with the generated cover, title, playlist name, elapsed and remaining `m:ss`, a range that seeks on commit, and one transport row in the order shuffle, previous, play/pause, next, repeat, play/pause larger than the others, each control at least 44px, shuffle and repeat names showing the current mode, volume and mute on that row above `48rem` and on a second row at `48rem` and below without horizontal scroll, and verify a static render shows that order, the cover text from `coverFromTitle`, and no YouTube thumbnail URL
- [ ] 4.2 Show `NowPlaying` as a fixed sheet, not a route, at `48rem` and below on every route and above `48rem` on every route except `/entertainment/music`; on a wide Music page render it in a third `.music-layout` column, move focus there from the mini player instead of opening a second copy, and give the sheet no document scroll (`overflow: hidden`, cover `min-height: 0`, height `100dvh`), and verify close sets `nowPlayingOpen` false without pausing, focus returns to the mini player, and resizing to a wide Music page closes the sheet

## 5. Queue sheet

- [ ] 5.1 Add `QueueSheet` over now playing, toggled by **Up next** with `aria-expanded` and `aria-controls`, `role="dialog"`, Escape and close clearing `queueOpen` without pausing, a vertical gesture of at least 48px that is ignored on a button, the seek range, or the scrolling list, the current id under **Now playing** with `aria-current="true"`, the following ids under **Next** in session order, a failed id showing the unavailable error, and a **Next** row calling `playAtIndex`, and verify an empty playlist renders no **Up next** control, the address does not change, and a static render lists the tail of `trackIds` under **Next**
- [ ] 5.2 Add a chrome render test that supplies a fixed session, does not call `loadYouTubeIframeApi` or construct `YT.Player`, and verify `npm test` shows the play/pause control separate from the open control, **Next** as the tail of `trackIds`, and no `.player-frame` or `iframe` in the markup

## 6. Page layout

- [ ] 6.1 Keep library and tracks stacked at 320px, 375px, and `48rem` with no horizontal scroll, show library, tracks, and the player column above `48rem`, set `.music-dialog` to `max-height: 100dvh` and `overflow: auto`, and verify the page, now playing, and the queue use existing theme variables, show no Spotify name, logo, wordmark, green, type, or artwork, contain no advertisement, sponsor slot, banner, or skip-ad control, and leave the collapsed sidebar rules unchanged

## 7. Check

- [ ] 7.1 Confirm `npm test` and `npm run build` succeed, with `dist/404.html` still emitted, and verify in the browser that the mini player opens now playing without the play/pause control doing so, close and the queue do not pause or change the route, the queue swipe and **Up next** keyboard control work, the sheet fits at 320px without page scroll, transport targets are at least 44px, volume wraps at `48rem`, dialogs scroll when the keyboard is open, light and dark mode stay readable, and Home, Health, Projects, Settings, and Account stay as they are aside from the mini player while a queue is active
