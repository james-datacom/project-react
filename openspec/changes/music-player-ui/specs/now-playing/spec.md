# Spec Delta

## Purpose

Let someone see the current song and the upcoming queue on one surface, hear audio without a video picture, and use that surface on a phone.

## ADDED Requirements

### Requirement: Now playing opens and closes without stopping
Now playing SHALL open from the mini player. On `/entertainment/music` it SHALL be the player region, and the playlist library and track list SHALL stay available behind it. A close control SHALL return to the mini player and, on the Music page, to the library and track list. Closing SHALL NOT pause playback.

#### Scenario: Close returns to the mini player
- **WHEN** now playing is open and the user activates close
- **THEN** the mini player is shown
- **THEN** playback continues

#### Scenario: Music page keeps the library behind now playing
- **WHEN** the user opens now playing on `/entertainment/music` and then closes it
- **THEN** the playlist library and the track list are available again
- **THEN** playback continues

### Requirement: Still cover and song identity
Now playing SHALL show a large square cover generated in the app from the song title. The cover SHALL NOT be a YouTube thumbnail and SHALL NOT play video. Under the cover, now playing SHALL show the song title and then the playlist name.

#### Scenario: Cover is a generated still
- **WHEN** now playing is open
- **THEN** it shows a large square still generated from the song title
- **THEN** that still is not a YouTube thumbnail and does not play video
- **THEN** the song title and the playlist name are shown, with the playlist name under the title

### Requirement: Seek
Now playing SHALL show elapsed time, a seek bar, and remaining time. Dragging the seek bar SHALL move playback to the released position. A keyboard user SHALL be able to move the seek position with the arrow keys.

#### Scenario: Dragging seeks
- **WHEN** the user drags the seek bar and releases it
- **THEN** playback moves to that position
- **THEN** elapsed time and remaining time match that position

#### Scenario: Arrow keys seek
- **WHEN** the seek bar has keyboard focus and the user presses an arrow key
- **THEN** the playback position moves in that direction

### Requirement: Transport row
Now playing SHALL show one transport row in this order: shuffle, previous, play/pause, next, repeat. Play/pause SHALL be the primary control and SHALL be larger than the others. Shuffle SHALL show whether it is off or on. Repeat SHALL show off, all, or one. Previous on the first song SHALL restart that song. Next on the last song SHALL stop when repeat is off. When repeat all is on, next on the last song SHALL start the first song. When repeat one is on, the current song SHALL start again when it finishes. Shuffle SHALL play each remaining song once before any of those songs plays again.

#### Scenario: Transport order
- **WHEN** now playing is open
- **THEN** the transport row shows shuffle, previous, play/pause, next, and repeat, in that order
- **THEN** play/pause is larger than the other transport controls

#### Scenario: Play and pause toggle
- **WHEN** a song is playing and the user activates play/pause
- **THEN** playback pauses
- **WHEN** playback is paused and the user activates play/pause
- **THEN** playback resumes

#### Scenario: Repeat cycles
- **WHEN** the user activates repeat three times from off
- **THEN** the mode moves through all, then one, then back to off
- **THEN** the repeat control shows the current mode

#### Scenario: Previous on the first song restarts it
- **WHEN** the first song is playing and the user activates previous
- **THEN** that same song starts again from the beginning

#### Scenario: Next on the last song stops
- **WHEN** repeat is off, the last song is playing, and the user activates next
- **THEN** playback stops

#### Scenario: Shuffle does not repeat inside a cycle
- **WHEN** shuffle is on and the user plays a playlist of three songs
- **THEN** each of those songs plays once before any of them plays again

### Requirement: Volume by screen width
Above `48rem`, volume and mute SHALL sit on the transport row. At `48rem` and below, volume and mute SHALL sit on a second row, and the transport row SHALL NOT scroll sideways. Each transport control SHALL have a tap target of at least 44px. Play/pause SHALL remain larger than the other controls.

#### Scenario: Wide screen keeps volume on the transport row
- **WHEN** the viewport is above `48rem` and now playing is open
- **THEN** volume and mute are on the same row as shuffle, previous, play/pause, next, and repeat

#### Scenario: Narrow screen moves volume to a second row
- **WHEN** the viewport is `48rem` or below and now playing is open
- **THEN** volume and mute are on a second row
- **THEN** the transport row does not scroll sideways
- **THEN** each transport control has a tap target of at least 44px

### Requirement: Queue is one gesture away
The queue SHALL be reachable from now playing. It SHALL NOT sit behind an overflow menu and SHALL NOT be a separate route. Now playing SHALL show a drag handle and an **Up next** label at the bottom. On a touch screen, swiping up SHALL open the queue. Swiping down on the queue, or its close control, SHALL return to now playing. The same **Up next** control SHALL open and close the queue by click and by keyboard. Playback SHALL continue while the queue opens and closes.

#### Scenario: Swipe up opens the queue
- **WHEN** the user swipes up on now playing on a touch screen
- **THEN** the queue opens
- **THEN** playback continues
- **THEN** the current page address does not change

#### Scenario: Swipe down returns to now playing
- **WHEN** the queue is open and the user swipes down
- **THEN** now playing is shown
- **THEN** playback continues

#### Scenario: Close returns to now playing
- **WHEN** the queue is open and the user activates its close control
- **THEN** now playing is shown
- **THEN** playback continues

#### Scenario: Up next toggles the queue
- **WHEN** the user activates **Up next**
- **THEN** the queue opens
- **WHEN** the user activates **Up next** again
- **THEN** the queue closes
- **THEN** playback has continued through both

#### Scenario: Keyboard toggles the queue
- **WHEN** the user activates **Up next** from the keyboard
- **THEN** the queue opens
- **WHEN** the user activates **Up next** from the keyboard again
- **THEN** the queue closes

### Requirement: Queue lists now playing and next
The queue SHALL list the current song under **Now playing** and the rest of the queue under **Next**, in play order. The current row SHALL be marked. Each row SHALL show the title. Choosing a row under **Next** SHALL start that song and SHALL continue through the remaining queue. Shuffle and repeat SHALL change what **Next** lists. **Next** SHALL update when the current song changes.

#### Scenario: Groups follow play order
- **WHEN** the queue is open
- **THEN** the current song is listed under **Now playing** and that row is marked
- **THEN** the remaining songs are listed under **Next** in play order
- **THEN** each row shows its title

#### Scenario: Choosing a later row starts there
- **WHEN** the user chooses a song under **Next**
- **THEN** that song starts
- **THEN** playback continues through the songs that follow it in the queue

#### Scenario: Next updates when the song changes
- **WHEN** the current song changes while the queue is open
- **THEN** **Now playing** shows the new current song
- **THEN** **Next** lists the songs that follow it

#### Scenario: Shuffle changes Next
- **WHEN** the user turns shuffle on while the queue is open
- **THEN** **Next** lists the shuffled order
- **THEN** **Next** does not list a song again before the cycle ends

### Requirement: Empty playlist and unavailable video
An empty playlist SHALL have no queue, and the queue SHALL NOT open. If the official player reports that a video is unavailable, that row SHALL show the error and the queue SHALL move to the next song using the same next-song rule.

#### Scenario: Empty playlist cannot open the queue
- **WHEN** the selected playlist has no songs
- **THEN** the queue cannot be opened

#### Scenario: Unavailable song is skipped
- **WHEN** the official player reports that the current video is unavailable and a later song remains
- **THEN** that row shows an error
- **THEN** playback moves to the next song

### Requirement: Audio only
Now playing and the queue SHALL contain no video picture and no YouTube player chrome. The 16:9 player frame SHALL be absent from the Music page and from these surfaces. The page SHALL NOT navigate to YouTube and SHALL NOT show the YouTube watch page, a title bar, related videos, or an end screen. Sound SHALL come from the official YouTube IFrame Player API. That player SHALL be the audio engine only and SHALL NOT appear in the layout. The app SHALL NOT play a song through a direct media URL, a stream extractor, or an alternate front end such as youtube-dl, yt-dlp, Invidious, or Piped. The app SHALL NOT add a skip-ad control or cover an advertisement.

#### Scenario: No video picture
- **WHEN** now playing is open and the queue is open
- **THEN** neither surface shows a video picture or YouTube player chrome
- **THEN** the 16:9 player frame is absent

#### Scenario: Playback stays in the app
- **WHEN** the user plays a song from now playing
- **THEN** the current page stays in this app
- **THEN** the YouTube watch page, a title bar, related videos, and an end screen are not shown
- **THEN** audio is produced through the official YouTube IFrame Player API
- **THEN** that player is not visible in the layout
- **THEN** the app does not request a direct media file for that video

#### Scenario: Player API fails to load
- **WHEN** the official player API fails to load
- **THEN** the transport stays visible
- **THEN** a short message says playback is unavailable

### Requirement: No advertisements from this product
The Music page, now playing, and the queue SHALL contain no advertisement, sponsor slot, banner, or skip-ad control. The app SHALL NOT load an ad network or render an ad component.

#### Scenario: Player surfaces have no ad slot
- **WHEN** the user views the Music page, now playing, and the queue
- **THEN** none of those surfaces shows an advertisement, sponsor slot, banner, or skip-ad control

### Requirement: Phone layout
At `48rem` and below, including at 320px wide and at 375px wide, the playlist library and the track list SHALL stack in one column, and the player SHALL NOT scroll horizontally. Now playing SHALL be a full-screen sheet. The cover SHALL scale down so the title, seek bar, transport, and **Up next** handle fit without the page itself scrolling on a 320px-wide screen. The queue SHALL be a sheet over now playing. Dialogs for a new playlist, edit, delete, and add song SHALL stay inside the viewport and SHALL be scrollable when the on-screen keyboard is open.

#### Scenario: Narrow Music page stacks
- **WHEN** the viewport is 320px wide, 375px wide, or `48rem` wide
- **THEN** the library and the track list stack in one column
- **THEN** the player does not scroll horizontally

#### Scenario: Now playing fits a 320px screen
- **WHEN** the viewport is 320px wide and now playing is open
- **THEN** now playing fills the screen
- **THEN** the title, seek bar, transport, and **Up next** handle are visible without the page itself scrolling

#### Scenario: Queue is a sheet
- **WHEN** the viewport is `48rem` or below and the user opens the queue
- **THEN** the queue is a sheet over now playing
- **THEN** the address does not change

#### Scenario: Dialogs stay usable with the keyboard
- **WHEN** the viewport is `48rem` or below and the user opens New playlist, edit, delete, or add song while the on-screen keyboard is open
- **THEN** that dialog stays inside the viewport
- **THEN** the dialog can be scrolled

### Requirement: Wide layout
Above `48rem`, the Music page SHALL show the playlist library, the track list, and the player. The player region SHALL use the now-playing layout and SHALL NOT be a video frame. The upcoming songs SHALL be reachable in one action from that surface, either shown under the cover or opened as the same sheet. Opening them SHALL NOT navigate to a new route. Other routes SHALL show only the mini player.

#### Scenario: Three regions on a wide Music page
- **WHEN** the viewport is above `48rem` and the user opens `/entertainment/music`
- **THEN** the page shows the library, the tracks, and the player
- **THEN** the player region uses the now-playing layout
- **THEN** the player region is not a video frame

#### Scenario: Queue stays one action away
- **WHEN** the viewport is above `48rem` and now playing is shown
- **THEN** the upcoming songs are reachable in one action
- **THEN** opening them does not navigate to a new route

### Requirement: Theme
Now playing and the queue SHALL stay readable in light mode and in dark mode using the existing theme tokens. They SHALL NOT use Spotify's name, logo, wordmark, green, type, or artwork. The collapsed sidebar SHALL keep its current behavior.

#### Scenario: Themes stay on the existing tokens
- **WHEN** the user views now playing in light mode and in dark mode
- **THEN** the surface remains readable in both themes
- **THEN** it does not show Spotify's name, logo, wordmark, green, type, or artwork

#### Scenario: Collapsed sidebar is unchanged
- **WHEN** the sidebar is collapsed and now playing is open
- **THEN** the sidebar keeps its collapsed behavior
