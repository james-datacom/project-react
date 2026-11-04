# Spec Delta

## MODIFIED Requirements

### Requirement: Create a playlist
New playlist SHALL ask for a name only and SHALL NOT ask for a description. The name SHALL be required, trimmed, and limited to 80 characters. Each playlist SHALL receive its own id. Two playlists MAY share a name.

#### Scenario: A named playlist is saved
- **WHEN** the user submits the name Focus
- **THEN** a playlist named Focus is listed
- **THEN** that playlist has its own id
- **THEN** no description was requested

#### Scenario: A blank name is rejected
- **WHEN** the user submits a name that is empty after trimming
- **THEN** no playlist is saved

#### Scenario: Length limits are enforced
- **WHEN** the name is longer than 80 characters
- **THEN** that value is rejected
- **THEN** no playlist is saved from that submission

#### Scenario: Shared names stay distinct
- **WHEN** the user creates two playlists that use the same name
- **THEN** both playlists are listed
- **THEN** each playlist has a different id

### Requirement: Edit and delete a playlist
Edit SHALL change the name of the selected playlist and SHALL NOT ask for or change a description. Edit SHALL NOT change any other playlist. Delete SHALL ask for confirmation, then remove that playlist and its songs. Deleting the playlist that is currently playing SHALL clear the player. Selecting a playlist SHALL show its name and tracks and SHALL NOT show a description, including when a description is already stored.

#### Scenario: Edit touches only the selected playlist
- **WHEN** the user edits the name of the selected playlist
- **THEN** that playlist shows the new name
- **THEN** every other playlist is unchanged

#### Scenario: Edit does not ask for a description
- **WHEN** the user opens Edit for a playlist
- **THEN** the form asks for the name
- **THEN** the form does not ask for a description

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
- **WHEN** the user selects a playlist that has a stored description
- **THEN** its name and tracks are shown
- **THEN** no description is shown

### Requirement: Song title
When the user pastes an accepted YouTube link, the app SHALL request `https://www.youtube.com/oembed?url=<encoded link>&format=json` at that moment and SHALL put the returned title into the title field. The title SHALL stay editable until the song is saved, and the saved title SHALL be the value in the field. When that request fails or returns no title, the field SHALL stay empty. An empty title MUST NOT be saved.

#### Scenario: Pasting a link fills the title
- **WHEN** the user pastes an accepted YouTube link into Add song
- **THEN** the app requests the oEmbed URL for that link
- **THEN** the title field shows the title from that response

#### Scenario: The filled title can be edited
- **WHEN** the title field was filled from a pasted link and the user changes it before saving
- **THEN** the saved title is the edited value

#### Scenario: Failed lookup requires a title
- **WHEN** the user pastes an accepted link and the oEmbed request fails or returns no title
- **THEN** the title field stays empty
- **THEN** the song is not saved
- **THEN** the user can save it after typing a title

#### Scenario: A cleared title is not saved
- **WHEN** the user clears the title and tries to save the song
- **THEN** the song is not saved
