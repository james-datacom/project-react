# Spec Delta

## Purpose

Let people keep playlists of songs added from YouTube links in the browser and manage those playlists on the Music page.

## ADDED Requirements

### Requirement: Music page
The Music page SHALL show the title Music and three regions: a playlist library, the selected playlist's tracks, and the app player. On a narrow screen the library and the track list SHALL stack, and the player SHALL stay reachable. Text and controls SHALL stay readable in light mode and in dark mode using the existing theme. The page SHALL NOT use a separate green theme or Spotify's logo, name, or artwork. Opening or refreshing `/entertainment/music` on the published site SHALL show this page.

#### Scenario: Three regions are present
- **WHEN** the user opens `/entertainment/music`
- **THEN** the page shows a playlist library, a track list for the selected playlist, and the app player

#### Scenario: Narrow layout stacks the library and tracks
- **WHEN** the user views the page on a narrow screen
- **THEN** the library and the track list are stacked
- **THEN** the player remains reachable

#### Scenario: Themes stay on the existing tokens
- **WHEN** the user views the page in light mode and in dark mode
- **THEN** the page remains readable in both themes
- **THEN** the page does not show Spotify's logo, name, or artwork

#### Scenario: Published route loads the page
- **WHEN** the user opens or refreshes `/entertainment/music` on the published site
- **THEN** the Music page is shown

### Requirement: Empty library
When no playlists are saved, the library SHALL show a short empty-state line and a New playlist action.

#### Scenario: First visit
- **WHEN** the user opens Music and no playlists are saved
- **THEN** the library shows a short empty-state line
- **THEN** a New playlist action is available

### Requirement: Create a playlist
New playlist SHALL ask for a name and an optional description. The name SHALL be required, trimmed, and limited to 80 characters. The description SHALL be optional and limited to 200 characters. Each playlist SHALL receive its own id. Two playlists MAY share a name.

#### Scenario: A named playlist is saved
- **WHEN** the user submits the name Focus and the description Quiet tracks
- **THEN** a playlist named Focus with that description is listed
- **THEN** that playlist has its own id

#### Scenario: A blank name is rejected
- **WHEN** the user submits a name that is empty after trimming
- **THEN** no playlist is saved

#### Scenario: Length limits are enforced
- **WHEN** the name is longer than 80 characters or the description is longer than 200 characters
- **THEN** that value is rejected
- **THEN** no playlist is saved from that submission

#### Scenario: Shared names stay distinct
- **WHEN** the user creates two playlists that use the same name
- **THEN** both playlists are listed
- **THEN** each playlist has a different id

### Requirement: Edit and delete a playlist
Edit SHALL change the name and description of the selected playlist and SHALL NOT change any other playlist. Delete SHALL ask for confirmation, then remove that playlist and its songs. Deleting the playlist that is currently playing SHALL clear the player. Selecting a playlist SHALL show its name, description, and tracks.

#### Scenario: Edit touches only the selected playlist
- **WHEN** the user edits the name and description of the selected playlist
- **THEN** that playlist shows the new name and description
- **THEN** every other playlist is unchanged

#### Scenario: Delete waits for confirmation
- **WHEN** the user activates Delete and does not confirm
- **THEN** the playlist and its songs remain

#### Scenario: Confirmed delete removes the playlist
- **WHEN** the user confirms Delete for a playlist
- **THEN** that playlist and its songs are removed
- **THEN** other playlists remain

#### Scenario: Deleting the playing playlist clears the player
- **WHEN** the user confirms Delete for the playlist that is currently playing
- **THEN** that playlist is removed
- **THEN** the player is cleared

#### Scenario: Selection shows the playlist
- **WHEN** the user selects a playlist
- **THEN** its name, description, and tracks are shown

### Requirement: Add a song from a YouTube link
The selected playlist SHALL offer Add song. The user SHALL paste one YouTube link. A saved song SHALL store a generated id, the original URL, the 11-character video id, the title, and the time it was added as an ISO-8601 timestamp. The same video SHALL NOT be added twice to the same playlist. The same video MAY exist in a different playlist.

#### Scenario: A watch link is saved
- **WHEN** the user adds `https://www.youtube.com/watch?v=dQw4w9WgXcQ` with the title Example title
- **THEN** the playlist stores that original URL
- **THEN** the stored video id is `dQw4w9WgXcQ`
- **THEN** the stored title is Example title
- **THEN** the song has its own id and an ISO-8601 added time

#### Scenario: Accepted video links
- **WHEN** the user adds any one of `https://www.youtube.com/watch?v=VIDEO_ID`, `https://youtube.com/watch?v=VIDEO_ID`, `https://youtu.be/VIDEO_ID`, `https://music.youtube.com/watch?v=VIDEO_ID`, `https://www.youtube.com/shorts/VIDEO_ID`, or `https://www.youtube.com/embed/VIDEO_ID`, and `VIDEO_ID` is 11 characters
- **THEN** the song is saved with that video id

#### Scenario: Extra watch parameters are ignored
- **WHEN** the user adds a watch URL whose video id is 11 characters and which also includes `t` or `list`
- **THEN** the song is saved with that video id
- **THEN** the extra parameters are not treated as a second song

#### Scenario: Rejected links
- **WHEN** the user submits an empty value, a channel URL, a playlist-only URL, a search URL, or a URL whose host is not YouTube
- **THEN** an inline message is shown
- **THEN** nothing is saved

#### Scenario: Duplicate video in one playlist
- **WHEN** the selected playlist already contains a video id and the user adds that video id again
- **THEN** the second copy is not saved
- **THEN** an inline message is shown

#### Scenario: Same video in another playlist
- **WHEN** a video id already exists on a different playlist and the user adds it to the selected playlist
- **THEN** the song is saved on the selected playlist

### Requirement: Song title
The title field SHALL be optional. When it is left blank, the app SHALL request `https://www.youtube.com/oembed?url=<encoded link>&format=json` and SHALL use the returned title. When that request fails or returns no title, the user MUST type a title before the song can be saved.

#### Scenario: Blank title is filled from oEmbed
- **WHEN** the user adds an accepted link and leaves the title blank
- **THEN** the app requests the oEmbed URL for that link
- **THEN** the saved title is the title from that response

#### Scenario: Failed lookup requires a title
- **WHEN** the user leaves the title blank and the oEmbed request fails
- **THEN** the song is not saved
- **THEN** the user can save it after typing a title

### Requirement: Remove a song
Each track row SHALL show the title and a Remove action. Remove SHALL delete that song only. If the removed song was playing, the player SHALL advance to the next song, or SHALL stop when the playlist is now empty.

#### Scenario: Remove deletes one song
- **WHEN** the user removes a song that is not playing
- **THEN** that song is gone
- **THEN** the other songs in the playlist remain

#### Scenario: Removing the playing song advances
- **WHEN** the user removes the song that is playing and a later song remains
- **THEN** that song is gone
- **THEN** playback continues at the next song

#### Scenario: Removing the last playing song stops
- **WHEN** the user removes the song that is playing and the playlist is then empty
- **THEN** playback stops

### Requirement: Library persistence
Playlist and song changes SHALL still be present after a reload. The library SHALL be stored in the browser under the key `music-library`. Each playlist SHALL store an id, name, description, createdAt, updatedAt, and its tracks. Ids SHALL be unique strings generated in the browser. Timestamps SHALL be ISO-8601. A missing or invalid stored value SHALL start as an empty library. The page SHALL NOT upload audio files, sync playlists to an account, or search YouTube.

#### Scenario: Changes survive reload
- **WHEN** the user creates a playlist, adds a song, and reloads the page
- **THEN** that playlist and song are still listed

#### Scenario: Invalid storage starts empty
- **WHEN** the stored `music-library` value is missing or invalid
- **THEN** the library is empty
- **THEN** the empty state and New playlist action are shown
