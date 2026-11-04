# Spec Delta

## Purpose

Let someone download the playlists stored in this browser as a JSON file and merge a saved file back into that library.

## ADDED Requirements

### Requirement: Playlist menu
The playlist section SHALL show a vertical ellipsis. Opening it SHALL offer Save Playlist and Import Playlist. The menu SHALL be available when the library has playlists and when it is empty.

#### Scenario: Menu offers save and import
- **WHEN** the user opens the vertical ellipsis on the playlist section
- **THEN** Save Playlist is available
- **THEN** Import Playlist is available

#### Scenario: Empty library still offers the menu
- **WHEN** no playlists are saved and the user opens the vertical ellipsis
- **THEN** Save Playlist is available
- **THEN** Import Playlist is available

### Requirement: Save playlist
Save Playlist SHALL download a JSON file that contains each playlist currently stored in the browser. Each playlist in the file SHALL include its id, its name, and its tracks. Each track SHALL include its video id, original URL, and title. The download SHALL NOT remove or change the playlists stored in the browser.

#### Scenario: Save downloads the stored playlists
- **WHEN** the browser has one or more playlists and the user chooses Save Playlist
- **THEN** a JSON file is downloaded
- **THEN** the file contains those playlists, including each playlist id, name, and tracks
- **THEN** the playlists stored in the browser are unchanged

#### Scenario: Save of an empty library
- **WHEN** no playlists are stored and the user chooses Save Playlist
- **THEN** a JSON file is downloaded
- **THEN** the file contains no playlists

### Requirement: Import playlist
Import Playlist SHALL read a JSON file from Save Playlist and SHALL store the result in the browser under the key `music-library`. Playlists already stored SHALL be kept. A playlist in the file whose id is not already stored SHALL be added. A playlist in the file whose id is already stored SHALL keep the stored playlist, and a track from the file whose video id is not already on that playlist SHALL be added. A video id already on that playlist SHALL NOT be added again. A file that is missing, empty, or not playlist JSON SHALL leave the library unchanged and SHALL show an inline message. Imported playlists SHALL still be present after a reload.

#### Scenario: Import into an empty library
- **WHEN** no playlists are stored and the user imports a valid playlist file
- **THEN** those playlists are stored under `music-library`
- **THEN** they are still present after a reload

#### Scenario: Import merges with existing playlists
- **WHEN** the browser already has playlists and the user imports a file whose playlist ids are new
- **THEN** every playlist that was already stored remains
- **THEN** the playlists from the file are also stored

#### Scenario: Same playlist id merges tracks
- **WHEN** the browser has a playlist id that also appears in the file
- **THEN** that stored playlist is kept
- **THEN** a track from the file whose video id is not on that playlist is added
- **THEN** a track whose video id is already on that playlist is not added again

#### Scenario: Same name and different id stays distinct
- **WHEN** the browser has a playlist and the file has a different id with the same name
- **THEN** both playlists are stored

#### Scenario: Invalid file is rejected
- **WHEN** the user imports a file that is missing, empty, or not playlist JSON
- **THEN** the library is unchanged
- **THEN** an inline message is shown
