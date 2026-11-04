# Proposal

## Why

Playlists still ask for a description nobody needs to see, and a song title is filled only when the add-song form is saved. The library also cannot leave the browser: there is no way to download it or merge a saved file back into the playlists already stored on this device.

## What Changes

- **BREAKING** Remove the playlist description. New playlist asks for a name only. Edit no longer includes a description. No playlist display shows a description, including the selected playlist header. Name rules stay as they are: required, trimmed, at most 80 characters. Two playlists may still share a name.
- When the user pastes an accepted YouTube link into Add song, fill the title from YouTube's oEmbed response at that moment. The title stays editable, and the edited value is what gets saved. If the lookup fails or returns no title, the field stays empty and a title is still required before save. Accepted links, rejected links, and the one-video-per-playlist rule do not change.
- On the playlist section, add a vertical ellipsis with two actions: **Save Playlist** and **Import Playlist**.
- Save Playlist downloads a JSON file that contains the playlist.
- Import Playlist reads that JSON and stores it in the browser under the existing `music-library` key. If the browser already has playlists, the import merges with them instead of replacing the library.
- Out of scope: accounts and sync, audio upload or download, YouTube search, and any change to playback, the mini player, or the now-playing view.

## Capabilities

### New Capabilities

- `playlist-transfer`: The playlist-section menu that downloads the playlist as JSON and imports a JSON file into browser local storage, merging with playlists already stored there.

### Modified Capabilities

None. `openspec list --specs` is empty. Playlist create, edit, display, song titles, and `music-library` persistence are specified on the completed `music-player` change as `music-library`, not under `openspec/specs/`. This change still revises that capability: description is removed from create, edit, and every display, and the song title is filled when a YouTube link is pasted and left editable before save. The specs artifact will include a `music-library` delta for those requirement changes, reusing that capability path.

## Impact

- Playlist create, edit, and the selected-playlist header live in `src/pages/MusicPage.tsx`. Description fields and the description line come out. The playlist section gains the ellipsis menu. Add song calls the existing oEmbed helper when a link is pasted, then keeps the title input editable.
- `src/music/library.ts` and `src/music/MusicProvider.tsx` today require a description on create and update. Those operations stop taking one. Stored playlists may still contain a description from before this change; the page does not show it.
- Save and import read and write the same browser key as `src/music/storage.ts` (`music-library`). Import merges into the library already loaded there. No new backend, account API, or playback dependency.
- Unit tests in `src/music/library.test.ts`, `src/music/storage.test.ts`, and `src/music/oembed.test.ts` cover the description removal, the merge, and title lookup. Playback files (`src/music/youtube-player.ts`, the mini player, and now playing) stay as they are.
