# Spec Delta

## Purpose

Let people play a playlist in this app's own player, keep listening from other pages, and hear music without advertisements added by this product.

## ADDED Requirements

### Requirement: Playback stays in this app
The player SHALL be part of this app. The Music page SHALL NOT navigate to YouTube and SHALL NOT show the YouTube watch page. Playback SHALL use the official YouTube IFrame Player API, mounted in the player and controlled by this app. The app SHALL NOT play a song through a direct media URL, a stream extractor, or an alternate front end such as youtube-dl, yt-dlp, Invidious, or Piped.

#### Scenario: Play does not leave the app
- **WHEN** the user plays a song
- **THEN** the current page stays in this app
- **THEN** the YouTube watch page is not shown

#### Scenario: Playback uses the official player
- **WHEN** a song plays
- **THEN** audio is produced through the official YouTube IFrame Player API mounted in this app
- **THEN** the app does not request a direct media file for that video

### Requirement: Transport controls
The visible controls SHALL belong to the app and SHALL include play, pause, previous, next, a seek bar, volume, and mute. The now-playing area SHALL show the song title and the playlist name. An empty playlist SHALL NOT be playable, and its play control SHALL be disabled.

#### Scenario: Controls and now playing are shown
- **WHEN** a song is playing
- **THEN** play, pause, previous, next, seek, volume, and mute are available
- **THEN** the now-playing area shows that song's title and the playlist name

#### Scenario: Empty playlist cannot play
- **WHEN** the selected playlist has no songs
- **THEN** the play control is disabled

### Requirement: Queue order
Play on a playlist SHALL start at the first song when shuffle is off. Play on a row SHALL start at that song and continue through the rest of the playlist. Previous and next SHALL follow playlist order when shuffle is off. Previous on the first song SHALL restart that song. Next on the last song SHALL stop when repeat is off.

#### Scenario: Play the playlist from the start
- **WHEN** shuffle is off and the user plays a playlist
- **THEN** playback starts at the first song
- **THEN** it continues through the playlist in saved order

#### Scenario: Play from a row
- **WHEN** shuffle is off and the user plays a track row
- **THEN** playback starts at that song
- **THEN** it continues through the songs after it in saved order

#### Scenario: Previous on the first song restarts it
- **WHEN** the first song is playing and the user activates previous
- **THEN** that same song starts again from the beginning

#### Scenario: Next on the last song stops
- **WHEN** repeat is off, the last song is playing, and the user activates next
- **THEN** playback stops

### Requirement: Repeat and shuffle
Repeat SHALL cycle through off, repeat all, and repeat one. When repeat all is on, next on the last song SHALL start the first song. When repeat one is on, the current song SHALL start again when it finishes, and next on the last song SHALL start the first song. Shuffle SHALL play each remaining song once, in an order that is not required to match the saved playlist order, before any of those songs plays again. When a shuffle cycle ends and repeat is off, playback SHALL stop. When a shuffle cycle ends and repeat all is on, a new cycle SHALL start.

#### Scenario: Repeat cycles
- **WHEN** the user activates repeat three times from off
- **THEN** the mode moves through repeat all, then repeat one, then back to off

#### Scenario: Repeat all wraps
- **WHEN** repeat all is on, the last song is playing, and the user activates next
- **THEN** playback starts at the first song

#### Scenario: Repeat one replays the current song
- **WHEN** repeat one is on and the current song finishes
- **THEN** that same song starts again

#### Scenario: Shuffle does not repeat inside a cycle
- **WHEN** shuffle is on and the user plays a playlist of three songs
- **THEN** each of those songs plays once before any of them plays again
- **THEN** playback is not required to follow the saved order

### Requirement: Unavailable video
If the official player reports that a video is unavailable, that row SHALL show an error and the queue SHALL move to the next song using the same next-song rule.

#### Scenario: Unavailable song is skipped
- **WHEN** the official player reports that the current video is unavailable and a later song remains
- **THEN** that row shows an error
- **THEN** playback moves to the next song

### Requirement: Player across routes
While a queue is active, a compact player bar SHALL stay at the bottom of the app shell on other routes. It SHALL offer the same controls at a smaller size. The bar SHALL reserve space and SHALL NOT otherwise change the layout of Home, Health, Projects, Settings, or Account. Leaving `/entertainment/music` SHALL NOT clear the queue. Reloading the page SHALL restore the saved library and SHALL NOT start playback.

#### Scenario: Playback continues on another route
- **WHEN** a queue is playing and the user opens Home
- **THEN** playback continues
- **THEN** a compact bar at the bottom of the shell offers the same controls at a smaller size
- **THEN** Home keeps its layout aside from the space reserved for that bar

#### Scenario: Leaving Music keeps the queue
- **WHEN** a queue is active and the user leaves `/entertainment/music` without reloading
- **THEN** the queue is still active

#### Scenario: Reload does not autoplay
- **WHEN** the user reloads the page
- **THEN** the saved library is restored
- **THEN** playback does not start on its own

### Requirement: No advertisements from this product
The Music page, the player bar, and the playlist dialogs SHALL contain no advertisement, sponsor slot, banner, or skip-ad control. The app SHALL NOT load an ad network or render an ad component. The app SHALL NOT cover, crop, or hide the official player in order to conceal an advertisement. A YouTube link SHALL identify the song only. This product SHALL NOT insert an advertisement before, during, or after a song, and SHALL NOT block or skip an advertisement that the official player is responsible for.

#### Scenario: Music surfaces have no ad slot
- **WHEN** the user views the Music page, the player bar, and a playlist dialog
- **THEN** none of those surfaces shows an advertisement, sponsor slot, banner, or skip-ad control

#### Scenario: The official player is not covered
- **WHEN** a song is playing
- **THEN** the app's controls and library are separate from the official player
- **THEN** the app does not overlay the official player to hide an advertisement
