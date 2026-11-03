# Story enhancement

Music Player UI Improvements

This builds on `story.md`. Playlist create, edit, and delete, adding and removing songs, accepted YouTube links, `localStorage`, and playback rules stay as they are. This change is how the player looks and how it behaves on a phone.

## User story

**As a** user listening in the app,
**I want** a now-playing screen with the upcoming songs one gesture away, sound without a video picture, and a layout that fits my phone,
**So that** I can see what is playing and what is next, and keep listening, without a video taking over the screen.

## Reference

The target layout follows the now-playing screen in [Spotify's 2019 queue update](https://www.androidpolice.com/2019/04/04/spotify-makes-your-song-queue-more-accessible-with-new-now-playing-ui/):

- A full-height now-playing view: large artwork, title, source name, a seek bar, and one row of transport controls.
- The queue used to sit behind a menu. On that screen it is part of now playing. A swipe up (or a Queue control) reveals **Up next** without leaving the song.
- A short bar stays at the bottom while the full view is closed. Opening the bar returns to now playing. Playback does not stop.

Copy that structure. Do not copy Spotify's name, logo, wordmark, green, type, or artwork. Keep the app's existing light and dark theme tokens.

## Scope

1. Replace the current player chrome (a visible 16:9 video frame plus a row of text buttons) with a mini player, a full now-playing view, and a queue sheet.
2. Play audio only. The user never sees a video picture, the YouTube watch page, related videos, or an end screen.
3. The Music page and the player work on a phone. At `48rem` and below, regions stack, the now-playing view fills the screen, and controls stay large enough to tap.

## Mini player

Shown on every route while a queue is active, including `/entertainment/music`. It replaces the compact bar.

| Piece | Behavior |
|-------|----------|
| Artwork | A small square still. Not a video frame. |
| Text | Song title and playlist name. Truncate with an ellipsis. Do not wrap onto a second line. |
| Play / pause | One control. It reflects the current state. |
| Open | Tapping the bar, outside that control, opens now playing. |
| Progress | A thin bar along the top edge shows elapsed time. It is not a second seek control. |

When nothing is queued, the bar is absent and the shell does not reserve space for it. Reloading still restores the library and does not autoplay.

## Now playing

Opens from the mini player. On the Music page it is also the player region: the library and track list stay available behind it, and closing now playing returns to them.

- A large square cover. Use a still generated in the app from the song title (for example a colored tile with the title's initials). Do not load the YouTube thumbnail and do not play the video in that space.
- Song title, then playlist name under it.
- Elapsed time, a seek bar, and remaining time. Dragging the bar seeks. Keyboard users can move it with the arrow keys.
- One transport row, in this order: shuffle, previous, play/pause, next, repeat. Play/pause is the primary control and is larger than the others.
- Shuffle and repeat show their current mode (off, all, one for repeat). The same rules as `story.md` apply: previous on the first song restarts it, next on the last song stops unless repeat is on, shuffle does not repeat a song until the cycle ends.
- Volume and mute sit with the transport row on wide screens. On a narrow screen they move to a second row so the transport row does not scroll sideways.
- A drag handle and an **Up next** label sit at the bottom. That is the way into the queue.
- A close control returns to the mini player. Closing does not pause.

## Queue

The queue is the point of the reference layout. It is reachable from now playing and is not buried in an overflow menu.

- On a touch screen, swiping up on now playing opens the queue. Swiping down on the queue, or the close control, returns to now playing. Playback continues through both.
- The same **Up next** control opens and closes it with a click or keyboard.
- The sheet shows two groups: **Now playing** (the current song) and **Next** (the rest of the queue, in play order).
- Each row shows the title. The current row is marked. Choosing a later row starts playback there and continues through the rest of the queue.
- Shuffle and repeat change what **Next** lists, and the list updates when the song changes.
- An empty playlist has no queue and cannot be opened. If the official player reports a video is unavailable, that row shows the error and the queue moves on, as in `story.md`.

## Audio only

The screen is a music player. It does not present a video.

- No video picture in the mini player, now playing, the queue, or the compact bar on other routes.
- The page never navigates to YouTube and never shows the YouTube watch page, a title bar, related videos, or an end screen.
- Sound still comes from the official YouTube IFrame Player API. The iframe is the audio engine only. It is not in the layout: no 16:9 frame, no letterbox, and no visible player chrome.
- This is an audio presentation. It is not an ad overlay. Do not add a skip-ad control, cover an advertisement, or switch to youtube-dl, yt-dlp, Invidious, Piped, or a direct media URL.
- If the iframe API fails to load, the transport stays visible and a short message says playback is unavailable.

## Responsive layout

The shell already collapses at `48rem`. This enhancement uses that same breakpoint.

**Phone (48rem and below)**

- The playlist library and the track list stack in one column. Nothing in the player scrolls sideways.
- The mini player is fixed to the bottom of the screen, full width, above the safe area. Page content clears it so the last track is not hidden behind it.
- Now playing is a full-screen sheet. The cover scales down so the title, seek bar, transport, and **Up next** handle fit without page scroll on a 320px-wide screen.
- Transport controls have a tap target of at least 44px. Play/pause is larger.
- The queue is a sheet over now playing, not a new route.
- Dialogs for new playlist, edit, delete, and add song stay inside the viewport and can be scrolled if the keyboard is open.

**Tablet and desktop (above 48rem)**

- The Music page keeps three regions: library, tracks, and the player. The player region uses the now-playing layout rather than a video frame.
- The queue can sit under the cover on the now-playing surface, or open as the same sheet. It stays one action away.
- Volume stays on the transport row.
- The mini player on other routes is a single bar: artwork, title, playlist, play/pause, and the thin progress. It does not grow into a second video row.

Light mode, dark mode, and the collapsed sidebar keep their current behavior. The player uses the same tokens as the rest of the shell.

## Acceptance criteria

### Now playing and queue

- [ ] While a queue is active, a mini player is fixed to the bottom on every route. It shows still artwork, the title, the playlist name, play/pause, and a thin progress bar.
- [ ] Activating the mini player opens now playing. Play/pause on the bar does not open it.
- [ ] Now playing shows a large still cover, title, playlist name, elapsed time, seek bar, remaining time, and the transport row in the order shuffle, previous, play/pause, next, repeat.
- [ ] Closing now playing returns to the mini player and does not pause.
- [ ] **Up next** is on the now-playing surface. A swipe up or the Queue control opens the upcoming songs. A swipe down or close returns to now playing.
- [ ] The queue lists the current song under **Now playing** and the rest under **Next**, in play order.
- [ ] Choosing a row in **Next** starts that song and continues through the remaining queue.
- [ ] The queue is not behind an overflow menu and is not a separate route.

### No video

- [ ] The mini player, now playing, and the queue contain no video picture and no YouTube player chrome.
- [ ] The 16:9 player frame is gone from the Music page and from the bar on other routes.
- [ ] Audio still plays, pauses, seeks, and follows previous, next, repeat, and shuffle.
- [ ] The official IFrame Player API remains the playback engine. No unofficial stream extractor is added.
- [ ] The Music page, the player, and the queue still contain no advertisement, sponsor slot, banner, or skip-ad control.

### Phone layout

- [ ] At 320px, 375px, and 48rem, the library and track list stack, and the player does not scroll horizontally.
- [ ] The mini player stays on screen while the track list scrolls, and the last track can scroll clear of it.
- [ ] Now playing fits the title, seek bar, transport, and queue handle on a 320px-wide screen without the page itself scrolling.
- [ ] Transport targets are at least 44px. Volume is on a second row at 48rem and below, and on the transport row above that.
- [ ] Playlist dialogs remain usable with the on-screen keyboard.
- [ ] Above 48rem, the Music page still shows the library, the tracks, and the player, and other routes still show only the mini player.

## Out of scope

- Spotify login, Spotify's catalog, Connect, lyrics, Canvas, and the Spotify visual design
- Editing the queue by dragging rows into a new order
- Video playback, fullscreen video, and picture-in-picture
- Downloading audio or bypassing YouTube's player
- Changes to how playlists and songs are saved

## Definition of done

- [ ] A listener can open now playing from the mini player and see the upcoming queue without leaving the song.
- [ ] Nothing on the player shows a video picture.
- [ ] The Music page and the player are usable at 320px wide and at the 48rem breakpoint, in light and dark mode.
- [ ] Play, pause, seek, volume, previous, next, repeat, and shuffle still follow `story.md`.
- [ ] Home, Health, Projects, Settings, and Account are unchanged aside from the mini player while a queue is active.
