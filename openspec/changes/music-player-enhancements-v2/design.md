# Design

## Context

Playlist create, edit, and the selected-playlist header live in `src/pages/MusicPage.tsx`. The playlist list is `PlaylistLibrary` (`aria-label="Playlists"`). Create and edit pass a description through `MusicProvider` into `createPlaylist` and `updatePlaylist` in `src/music/library.ts`. The header renders `playlist.description` when it is non-empty. Add song calls `fetchYouTubeTitle` only on submit, and only when the title field is blank.

`Playlist` still stores `description`. `parseLibrary` in `src/music/storage.ts` rejects the whole `music-library` value unless every playlist has a string description. Save and load already use `{ playlists: [...] }` under that key. See proposal.md for why this change exists, and the delta specs for the behavior it has to meet.

## Goals / Non-Goals

**Goals:**

- Keep playlist rules and the import merge in plain functions that Vitest can run without a file dialog or a YouTube request.
- Leave an existing `music-library` value readable. A stored description stays in the record and is not shown.
- Fill the title when the link becomes an accepted YouTube URL, and save whatever the field holds after the user edits it.

**Non-Goals:**

- Removing `description` from the stored playlist shape, or rewriting local storage on load.
- Changing playback, the mini player, now playing, or the queue.
- A new dependency for menus, downloads, or file picking.

## Decisions

### Description stays stored and leaves the forms

`createPlaylist` and `updatePlaylist` take a name only. Validation still trims the name and rejects an empty name or a name longer than 80 characters. It no longer reads or limits a description.

Create writes `description: ''`. Update copies the playlist's current `description` onto the next record so an older value is not wiped and is not edited. `MusicProvider.createPlaylist` and `updatePlaylist` drop the description argument. Both dialogs in `MusicPage.tsx` drop the description field. The selected-playlist header drops the description line. The playlist list already shows the name only.

Stripping `description` from `Playlist` and from `isPlaylist` was rejected. A library saved before this change would fail `parseLibrary` and come back empty.

### Title lookup runs when the link is accepted

The Add song link field still uses `parseYouTubeVideoUrl`. When the current value is an accepted link, the page calls `fetchYouTubeTitle` for that URL and writes the result into the title field. A failed or empty response clears the field. The title input stays editable. Submit saves `title.trim()` and does not call oEmbed again. An empty title sets the existing inline error and does not call `addTrack`.

A newer accepted URL cancels the effect of an older response, so a slow lookup cannot overwrite the title for the link now in the field. Typing that does not yet parse as a video URL does not fetch.

Fetching only when the title is still blank, which is what submit does today, was rejected because a paste must fill the field even if the user already typed one, and the saved value must be the edited field.

### The ellipsis belongs to the playlist list

`PlaylistLibrary` adds a vertical-ellipsis button (`EllipsisVertical`) in the bar next to search and add playlist, with `aria-label="Playlist actions"` and `aria-expanded`. It is rendered with that bar, including when `playlists` is empty. The open menu has two actions: Save Playlist and Import Playlist. Escape and a second press on the button close it. The song page does not get this menu. Save exports every stored playlist, and the empty-library case is this view.

A menu on each playlist row was rejected because the file is the whole library, not the open playlist.

### Save and import share the stored JSON shape

New `src/music/transfer.ts`:

- `serializeLibrary(library)` returns the JSON string of `{ playlists }` using the same fields `saveLibrary` writes, including id, name, description, timestamps, and each track's id, `youtubeUrl`, `videoId`, title, and `addedAt`.
- `mergeLibraries(current, raw)` parses `raw` with the same acceptance rules as `parseLibrary`. A missing string, `""`, invalid JSON, or a value that is not that shape returns a failure and does not produce a library. `{ "playlists": [] }` is valid and merges to the current library unchanged.
- Playlists are matched by id. An id that is not in `current` is appended with its stored tracks. An id that is already in `current` keeps the stored playlist's name, description, timestamps, and track list, and appends imported tracks whose `videoId` is not already on that playlist. A repeated `videoId` is dropped. A different id with the same name is appended. The result is a new library. The function does not read or write storage.

Save Playlist builds a `Blob` from `serializeLibrary(music.library)`, clicks a temporary anchor with `download="music-library.json"`, and revokes the object URL. It does not call `saveLibrary`.

Import Playlist uses a visually hidden `<input type="file" accept="application/json,.json">`. The page reads the file as text and calls `MusicProvider.importLibrary`. That reads `libraryRef.current`, runs `mergeLibraries`, and on success uses the same commit path as create and update so the merged library is written under `music-library` and survives reload. On failure it returns an error string and does not commit. The page shows that string in the playlist section with `role="alert"`. The input value is cleared after each choice so the same file can be chosen again.

Reusing `FileSystemAccessAPI`, or replacing the library with the file, was rejected. The first is unnecessary for a download, and the second drops playlists the spec says to keep.

## Risks / Trade-offs

- [oEmbed is slow or blocked] → The field stays empty and submit requires a typed title. A stale response is ignored when the link has changed.
- [A stored description is invisible and not editable] → It remains in `music-library` so existing data still loads. Update does not clear it.
- [A hand-edited file that drops `description` or a timestamp fails import] → Save writes the same shape `parseLibrary` already accepts. The failure message leaves the current library in place.
- [Two playlists share an id across files and their names differ] → The stored name wins. Tracks still merge by `videoId`. Matching on name was rejected because two playlists may legally share a name.

## Migration Plan

No storage migration and no deploy change. On release, existing libraries load as they do now. New playlists persist `description: ''`. The header and both forms stop showing a description. Rollback is reverting the page and the provider methods. Records written with an empty description stay valid for the previous parser.

Imported data is written only after `mergeLibraries` succeeds, through the existing save. A rejected file does not change `music-library`.
