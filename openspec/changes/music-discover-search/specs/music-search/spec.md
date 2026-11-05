# Spec Delta

## Purpose

Let people search YouTube from the Music Search page and see each result's artwork and title, including songs they can save into the library.

## ADDED Requirements

### Requirement: Search page
The Search page at `/entertainment/music/search` SHALL show a search field and a Cancel action. The field placeholder SHALL be "What do you want to listen to?". The header title SHALL be Search. The field, Cancel, and rows SHALL stay readable in light mode and in dark mode.

#### Scenario: The field and Cancel are shown
- **WHEN** the user opens `/entertainment/music/search`
- **THEN** a search field with the placeholder "What do you want to listen to?" is shown
- **THEN** a Cancel action is shown
- **THEN** the header title is Search

#### Scenario: Themes stay readable
- **WHEN** the user views the Search page in light mode and in dark mode
- **THEN** the field, Cancel, and rows remain readable

### Requirement: Cancel clears the query
Cancel SHALL clear the search field and SHALL show recent searches. Cancel SHALL NOT remove saved songs from the library and SHALL NOT start playback.

#### Scenario: Cancel returns to recent searches
- **WHEN** the field contains a query and the user activates Cancel
- **THEN** the field is empty
- **THEN** recent searches are shown
- **THEN** saved songs remain in the library
- **THEN** playback does not start

### Requirement: Recent searches
When the search field is empty, the page SHALL show the heading Recent searches and the songs, artists, and playlists previously returned by search on this device. That list SHALL be kept on this device and SHALL still be present after a reload. When nothing has been searched, the page SHALL show the heading and no rows.

#### Scenario: Empty field shows recent searches
- **WHEN** the user opens Search with an empty field after a song was returned by an earlier search
- **THEN** the heading Recent searches is shown
- **THEN** that song is listed

#### Scenario: Recent searches survive reload
- **WHEN** the user has recent searches and reloads the Search page
- **THEN** those recent searches are still listed

#### Scenario: No history yet
- **WHEN** the user opens Search and no search has returned results on this device
- **THEN** the heading Recent searches is shown
- **THEN** no rows are shown

### Requirement: YouTube results
When the user enters a non-empty query, the page SHALL replace recent searches with matching results from YouTube. Each result SHALL show artwork and a title, and SHALL be a song, an artist, or a playlist. A song row SHALL name the artist. Song and playlist artwork SHALL be square. Artist artwork SHALL be round. The page SHALL NOT navigate to YouTube and SHALL NOT show the YouTube watch page. Activating a row SHALL NOT start playback.

#### Scenario: A query shows YouTube matches
- **WHEN** the user enters a non-empty query that has YouTube matches
- **THEN** recent searches are not shown
- **THEN** each match shows artwork and a title

#### Scenario: A song row names the artist
- **WHEN** a result is a song
- **THEN** the row shows the type Song
- **THEN** the row shows the artist name
- **THEN** the artwork is square

#### Scenario: An artist row uses a round avatar
- **WHEN** a result is an artist
- **THEN** the row shows the type Artist
- **THEN** the artwork is round

#### Scenario: A playlist row is labeled
- **WHEN** a result is a playlist
- **THEN** the row shows the type Playlist
- **THEN** the artwork is square

#### Scenario: Search does not open YouTube or play
- **WHEN** results are shown and the user activates a row
- **THEN** the YouTube watch page is not shown
- **THEN** playback does not start

### Requirement: Search with no match or a failed lookup
When a query has no YouTube matches, the page SHALL show a short line that nothing matched and SHALL NOT show invented rows. When the lookup fails, the page SHALL show a short error and SHALL NOT show invented rows. Cancel SHALL still return to the recent searches already stored.

#### Scenario: Nothing matched
- **WHEN** the user enters a query that has no YouTube matches
- **THEN** no result rows are shown
- **THEN** a short line says that nothing matched

#### Scenario: Lookup fails
- **WHEN** the user enters a query and the YouTube lookup fails
- **THEN** no result rows are shown
- **THEN** a short error is shown

#### Scenario: Cancel still shows stored recents
- **WHEN** a query matches nothing and the user activates Cancel
- **THEN** the recent searches stored before that query are shown

### Requirement: Results become recent searches
Results returned for a query SHALL be remembered as recent searches on this device. After the field is cleared, those results SHALL be listed under Recent searches. The same song, artist, or playlist SHALL appear once.

#### Scenario: Clearing the field keeps the results
- **WHEN** a query has returned results and the user clears the field
- **THEN** those results are listed under Recent searches

#### Scenario: A repeated result is listed once
- **WHEN** the same song is returned by a later search
- **THEN** that song appears once in recent searches

### Requirement: Add and already added
Each result row and each recent-search row SHALL show either an add action or an added check. A song whose video is already in the music library SHALL show the check and SHALL NOT show add. Activating add on a song that is not in the library SHALL save that song into the library and SHALL then show the check. Activating add SHALL NOT start playback. An artist or playlist row SHALL show add until the user adds it, and SHALL then show the check. Adding an artist or a playlist SHALL NOT add a song to the library.

#### Scenario: Add saves a new song
- **WHEN** the user activates add on a song that is not in the library
- **THEN** that song is stored in the library
- **THEN** the row shows the added check
- **THEN** playback does not start

#### Scenario: A saved song shows a check
- **WHEN** a song row is for a video already stored in the library
- **THEN** the row shows the added check
- **THEN** add is not shown

#### Scenario: Adding an artist does not save a song
- **WHEN** the user activates add on an artist row
- **THEN** the row shows the added check
- **THEN** no song is added to the library

#### Scenario: Adding a playlist does not save a song
- **WHEN** the user activates add on a playlist row
- **THEN** the row shows the added check
- **THEN** no song is added to the library

### Requirement: Remove a recent search
Each recent-search row SHALL have a remove action. Remove SHALL drop that row from recent searches only. It SHALL NOT delete a saved song from the library.

#### Scenario: Remove drops one recent row
- **WHEN** the user removes one recent-search row
- **THEN** that row is gone from recent searches
- **THEN** the other recent searches remain

#### Scenario: Remove keeps the library song
- **WHEN** the user removes a recent-search row for a song that is saved in the library
- **THEN** that song remains in the library

### Requirement: Music library filter stays local
The Search music control on the Music page SHALL keep filtering saved playlists and songs. It SHALL NOT query YouTube.

#### Scenario: The library filter does not search YouTube
- **WHEN** the user filters the Music library
- **THEN** the list is limited to saved playlists and songs that match
- **THEN** YouTube results are not shown
