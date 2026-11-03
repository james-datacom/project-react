# Design

## Context

Playback already lives in the shell. `MusicProvider` holds the library and the in-memory session (`trackIds`, `index`, `failedIds`, repeat, shuffle). `queue.ts` decides order. `PlayerBar` loads `https://www.youtube.com/iframe_api`, constructs `YT.Player`, and renders a visible 16:9 `.player-frame` plus separate Play and Pause buttons. `AppShell` mounts that bar on `/entertainment/music` or while a session exists, in a third grid row of `.shell`. Below `48rem`, `.music-layout` is one column. See proposal.md for why the chrome changes. The delta specs in `specs/mini-player/spec.md` and `specs/now-playing/spec.md` are the behavior this design has to satisfy. Playlist edits, link parsing, `music-library`, and the queue rules stay as they are.

## Goals / Non-Goals

**Goals:**

- Keep one official player mounted for the life of a session, with no visible frame.
- Drive the mini player, now playing, and the queue from the session that already exists.
- Use the shell's `48rem` breakpoint for the sheet, the volume row, and the Music page columns.
- Leave queue order testable without mounting YouTube.

**Non-Goals:**

- A second playback engine, a React YouTube package, or a persisted playhead.
- Reordering the queue by dragging rows.
- A new route for now playing or the queue.
- Restyling Home, Health, Projects, Settings, Account, or the Entertainment menu.

## Decisions

### One hidden player, three visible surfaces

Replace `PlayerBar` with four pieces under `src/music/`. The shell still owns them, so a route change does not rebuild the iframe.

- `AudioEngine` is the current load, command, timer, and error effects. Its host stays mounted while `session !== null`. It renders no 16:9 frame.
- `MiniPlayer` is fixed to the bottom while a session exists, including on `/entertainment/music`. It is not rendered when `session` is null, and `.shell` does not keep a third grid row for it.
- `NowPlaying` is the cover, seek, transport, and **Up next** handle.
- `QueueSheet` lists the session order. It is not a route.

`AppShell` stops passing `compact`. `showPlayer` becomes `session !== null`. The engine and the mini player mount together. Opening or closing a surface only changes component state in `MusicProvider` (`nowPlayingOpen`, `queueOpen`). Both reset when the session is cleared. Closing either surface does not call pause.

A player that stays inside `MusicPage` was rejected because leaving the page would destroy the iframe. Keeping the 16:9 frame and hiding it with a cover was rejected because the specs forbid a video picture and forbid covering the official player.

### The iframe is off-screen, not covered

The host is a single element clipped out of view: a non-zero size, `position: absolute`, and a clip that removes it from the layout. It is `aria-hidden` and not focusable. It is not `display: none` and not `width: 0; height: 0`. Nothing is painted on top of it. `playerVars` stay `controls: 0`, `rel: 0`, `playsinline: 1`, and `origin` set to `window.location.origin`. No skip-ad control is added. If `loadYouTubeIframeApi` rejects, the transport still renders and a short alert says playback is unavailable. The app does not request a media file.

`display: none` was rejected because the iframe API can stall when the host has no box. An opacity overlay was rejected because that covers the player.

### Generated cover, one function

`cover.ts` exports `coverFromTitle(title)`. It returns initials and a background color. Initials are the first character of the first two words, uppercased, or the first two characters of a single word. The color is chosen by a hash of the title from a fixed palette. The palette does not include Spotify green. The same result is used for the mini player's small square and the large cover. No thumbnail request is added.

Doing this in the component, or storing an image URL on the track, was rejected. The library shape does not change, and the tests can run without the player.

### Mini player hit targets

The bar is a control that opens now playing, with a separate play/pause button inside it. The button stops the open action. Its accessible name is Pause while a song is playing and Play while it is paused. Title and playlist name use one line, hidden overflow, and an ellipsis. The progress indicator is a non-interactive strip along the top, `aria-hidden`, with a width from `currentTime / duration`. It does not call `seekTo`.

On viewports above `48rem` the bar sits in the content column, after the sidebar, so the sidebar is not covered. At `48rem` and below it is full width, with `padding-bottom: env(safe-area-inset-bottom)`. While it is mounted, `main` gets bottom padding equal to the bar so the last track can scroll clear. When the session is null, that padding is not applied.

### Where now playing is shown

`nowPlayingOpen` is the sheet. It is a fixed layer over the current page, not a route. It is used at `48rem` and below on every route, and above `48rem` on every route except `/entertainment/music`. Close sets `nowPlayingOpen` to false and leaves the session playing. Focus returns to the mini player.

Above `48rem` on `/entertainment/music`, the page keeps three columns. `.music-layout` gains a third track: library, tracks, and a player column. That column renders `NowPlaying` while a session exists, and a short empty state when it does not. Activating the mini player on that page moves focus to the column instead of opening a second copy. The column has no close control, because the wide page already shows the library and the tracks beside it. Resizing from a narrow sheet to that width closes the sheet and shows the column.

A sheet on the wide Music page as well was rejected because it would hide the three regions the spec requires. An always-visible third column on a phone was rejected because the phone surface has to be a full-screen sheet that fits without page scroll.

The sheet is a column: cover, identity, seek, transport, then the handle. The cover is `min-height: 0` and shrinks so the title, seek, transport, and handle fit inside `100dvh` at 320px. The sheet uses `overflow: hidden`. The document behind it does not scroll.

### Transport and seek

One row, in order: shuffle, previous, play/pause, next, repeat. Play/pause is one button, at least 44px, and larger than the others. Each other transport control is at least 44px square. Shuffle and repeat show their mode in the accessible name (`Shuffle on` or `Shuffle off`, `Repeat off`, `Repeat all`, `Repeat one`). They call the provider actions that already exist.

Volume and mute stay on that row above `48rem`. At `48rem` and below they wrap to a second row. The row does not scroll horizontally.

Seek stays an `input type="range"` with `min`, `max`, and `step`. Arrow keys are the native range behavior. `seekTo` runs when the user commits the value, not on the mini player's progress strip. Elapsed and remaining are `m:ss`.

### Queue sheet reads the session

`QueueSheet` opens over now playing on every width. **Up next** toggles `queueOpen` by click and by keyboard (`aria-expanded`, `aria-controls`). The sheet is `role="dialog"` and labelled **Up next**. Escape and the close control set `queueOpen` false. A vertical pointer gesture of at least 48px opens it from now playing and closes it from the sheet. The gesture is ignored when it starts on a button, the seek range, or a scrolling list. Playback is not touched.

The current `session.trackIds[session.index]` is the **Now playing** row and is marked `aria-current="true"`. The ids after that index are **Next**, in array order. Shuffle and repeat already rewrite `trackIds` through `queue.ts`, so the sheet does not sort on its own. A failed id shows the same unavailable error the track list shows.

Choosing a **Next** row calls a new `playAtIndex(queue, index)` in `queue.ts`. It returns the same `trackIds` with the new index and does not reshuffle. `startAtTrack` stays for starting from the track list, because that function builds a new order when shuffle is on. An empty playlist never creates a session, **Up next** is not rendered, and the sheet cannot open.

Dragging rows was rejected. It is out of scope, and the session order is already the play order.

### Dialogs and theme

`.music-dialog` keeps `width: min(28rem, calc(100% - 2rem))` and gains `max-height: 100dvh` and `overflow: auto`, so New playlist, edit, delete, and add song stay on screen when the keyboard is open. Colors come from the existing theme variables. No new palette and no Spotify mark. The collapsed sidebar rules are not edited.

### Tests

`cover.test.ts` checks initials, a stable color for the same title, and that the palette is not Spotify green. `queue.test.ts` gains `playAtIndex`: a later index plays from there through the same id list, including when that list was already shuffled. A render test of the chrome, with the provider session stubbed and `YT.Player` unmounted, checks that play/pause does not open now playing, that the bar click does, that **Next** is the tail of `trackIds`, and that the visible tree has no `.player-frame` and no `iframe`. `npm test` does not load the iframe API.

## Risks / Trade-offs

- [An off-screen iframe can still play a YouTube advertisement the user cannot see] → No skip control and no cover are added. The host is clipped out of the layout instead of painted over. Hearing an ad the official player inserts is accepted.
- [Clipping can still stall playback in some browsers] → The host keeps a non-zero box. If the API rejects, the transport stays and the alert is shown. There is no direct-URL fallback.
- [A swipe can fight a scroll] → The gesture is vertical, past 48px, and ignored on controls and on the queue list.
- [Wide Music and the sheet could both mount now playing] → The column is used only above `48rem` on `/entertainment/music`. Every other case uses the sheet. Resize closes the sheet.
- [The first play mounts the engine a moment after the session starts] → The existing command effect already waits for `ready` before `loadVideoById`. The visible transport does not depend on that ready flag.
- [Fixed positioning can cover the sidebar on a wide screen] → Above `48rem` the bar is offset by the sidebar width. At `48rem` and below the sidebar is an overlay, and the bar is full width.
- [320px still overflows if the cover cannot shrink] → The sheet is `overflow: hidden` and the cover's minimum height is 0. The check is a render at 320px, not a second page scroll.

## Migration Plan

1. Add `coverFromTitle` and `playAtIndex` with their unit tests. Leave storage and link parsing alone.
2. Split the chrome into the engine, mini player, now playing, and queue sheet. Remove `.player-frame` and the third shell row. Add the fixed bar, the sheet, the third Music column, and the dialog max-height.
3. Confirm `npm test` and `npm run build`. The build still emits `dist/404.html`.
4. To roll back, revert the commit. `music-library` is unchanged. A session that was only in memory disappears on reload either way.

## Open Questions

None. The hidden host, the wide-Music column versus the sheet, and playing a later queue row without reshuffling are settled above.
