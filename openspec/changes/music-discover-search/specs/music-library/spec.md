# Spec Delta

## ADDED Requirements

### Requirement: Save a song from search
A song added from Search SHALL be stored in the music library with its own id, the YouTube video id, the title shown on the search row, and an ISO-8601 added time. The song SHALL be listed in the library. When that video id is already stored in the library, Search SHALL NOT save a second copy. Saving from Search SHALL NOT start playback and SHALL NOT change any other song. Adding an artist or a playlist from Search SHALL NOT create a song.

#### Scenario: A new song is listed in the library
- **WHEN** the user adds a song from Search that is not already in the library
- **THEN** the library lists that song
- **THEN** the stored title is the title from the search row
- **THEN** the stored video id is the video id from that row
- **THEN** the song has its own id and an ISO-8601 added time

#### Scenario: An existing video is not copied
- **WHEN** the user adds a song from Search whose video id is already in the library
- **THEN** a second copy is not saved

#### Scenario: Playback stays stopped
- **WHEN** the user adds a song from Search
- **THEN** playback does not start
- **THEN** other songs in the library are unchanged

#### Scenario: An artist add creates no song
- **WHEN** the user adds an artist from Search
- **THEN** the library's songs are unchanged

#### Scenario: A playlist add creates no song
- **WHEN** the user adds a playlist from Search
- **THEN** the library's songs are unchanged
