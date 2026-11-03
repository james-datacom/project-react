# Spec Delta

## Purpose

Let someone keep the current song at the bottom of every page and open now playing from it, without a video picture or a reserved gap when nothing is queued.

## ADDED Requirements

### Requirement: Mini player while a queue is active
The mini player SHALL be fixed to the bottom of the screen on every route, including `/entertainment/music`, while a queue is active. When nothing is queued, the mini player SHALL be absent and the shell SHALL NOT reserve space for it. Reloading SHALL restore the saved library and SHALL NOT start playback.

#### Scenario: Active queue shows the bar on Music
- **WHEN** a queue is active and the current page is `/entertainment/music`
- **THEN** the mini player is fixed to the bottom of the screen

#### Scenario: Active queue shows the bar on another route
- **WHEN** a queue is active and the user opens Home
- **THEN** a mini player is fixed to the bottom of the screen
- **THEN** Home keeps its layout aside from that bar

#### Scenario: Other pages keep their layout
- **WHEN** a queue is active and the user opens Health, Projects, Settings, or Account
- **THEN** each page keeps its layout aside from the mini player

#### Scenario: Empty queue hides the bar
- **WHEN** nothing is queued
- **THEN** the mini player is absent
- **THEN** the shell does not reserve space for it

#### Scenario: Reload does not autoplay
- **WHEN** the user reloads the page
- **THEN** the saved library is restored
- **THEN** playback does not start on its own
- **THEN** the mini player stays absent until a queue is active

### Requirement: Mini player contents
The mini player SHALL show a small square still, the song title, the playlist name, and one play/pause control. The still SHALL NOT be a video frame. The title and the playlist name SHALL each stay on one line and SHALL truncate with an ellipsis. Play/pause SHALL reflect the current state. A thin bar along the top edge SHALL show elapsed time and SHALL NOT seek.

#### Scenario: Bar shows the current song
- **WHEN** a queue is active
- **THEN** the mini player shows a small square still, the song title, and the playlist name
- **THEN** the title and the playlist name each stay on one line and truncate with an ellipsis
- **THEN** the still is not a video frame

#### Scenario: Play and pause match the current state
- **WHEN** a song is playing
- **THEN** the control shows pause
- **WHEN** playback is paused
- **THEN** the control shows play

#### Scenario: Progress shows elapsed time
- **WHEN** a song is partway through
- **THEN** a thin bar along the top edge shows the elapsed portion
- **THEN** dragging that bar does not seek

### Requirement: Opening now playing
Activating the mini player outside play/pause SHALL open now playing and SHALL NOT stop playback. Activating play/pause SHALL toggle playback and SHALL NOT open now playing.

#### Scenario: The bar opens now playing
- **WHEN** the user activates the mini player outside play/pause
- **THEN** now playing opens
- **THEN** playback does not stop

#### Scenario: Play and pause stays on the bar
- **WHEN** the user activates play/pause on the mini player
- **THEN** playback toggles
- **THEN** now playing does not open

### Requirement: Mini player shows no video
The mini player SHALL contain no video picture and no YouTube player chrome. It SHALL NOT be a 16:9 player frame. Activating the mini player SHALL NOT navigate to YouTube or show the YouTube watch page.

#### Scenario: No video picture on the bar
- **WHEN** the mini player is visible
- **THEN** it shows no video picture and no YouTube player chrome
- **THEN** it is not a 16:9 player frame
- **THEN** the YouTube watch page is not shown

### Requirement: Mini player on a narrow screen
At `48rem` and below, the mini player SHALL be full width and sit above the safe area. Page content SHALL clear it so the last track can scroll out from behind it. Above `48rem`, on routes other than `/entertainment/music`, the mini player SHALL remain a single bar and SHALL NOT grow into a second video row.

#### Scenario: The last track can scroll clear
- **WHEN** the viewport is `48rem` or below, a queue is active, and the user scrolls the track list
- **THEN** the mini player stays fixed to the bottom, full width, above the safe area
- **THEN** the last track can scroll clear of the mini player

#### Scenario: Other routes stay a single bar
- **WHEN** the viewport is above `48rem`, a queue is active, and the user opens Home
- **THEN** only the mini player is shown
- **THEN** it does not grow into a second video row

### Requirement: Mini player uses the existing theme
The mini player SHALL stay readable in light mode and in dark mode using the existing theme tokens. It SHALL NOT show Spotify's name, logo, wordmark, green, type, or artwork.

#### Scenario: Themes stay on the existing tokens
- **WHEN** the user views the mini player in light mode and in dark mode
- **THEN** the bar remains readable in both themes
- **THEN** it does not show Spotify's name, logo, wordmark, green, type, or artwork

### Requirement: Mini player adds no advertisement
The mini player SHALL contain no advertisement, sponsor slot, banner, or skip-ad control.

#### Scenario: The bar has no ad slot
- **WHEN** the mini player is visible
- **THEN** it shows no advertisement, sponsor slot, banner, or skip-ad control
