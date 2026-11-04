# Tasks

## 1. Playlist description

- [ ] 1.1 Change `createPlaylist` and `updatePlaylist` in `src/music/library.ts` so they take a name only, still trim it and reject an empty name or a name longer than 80 characters, write `description: ''` on create, and copy the stored description on update, and verify `src/music/library.test.ts` passes `npm test` for Focus saved with its own id and an empty description, a blank name, a name longer than 80 characters, two playlists that share a name and have different ids, and an edit that changes only the selected playlist's name and leaves its stored description and every other playlist unchanged
- [ ] 1.2 Drop the description argument from `createPlaylist` and `updatePlaylist` in `src/music/MusicProvider.tsx`, and remove the description field from the create and edit dialogs and the description line from the selected-playlist header in `src/pages/MusicPage.tsx`, and verify `src/pages/MusicPage.test.tsx` passes `npm test` for an empty library, a stored description of Quiet tracks that is absent from both the playlist list and `/entertainment/music/p1`, and no Description field in the page source

## 2. Song title on paste

- [ ] 2.1 In the Add song dialog in `src/pages/MusicPage.tsx`, call `fetchYouTubeTitle` when the link field becomes an accepted YouTube URL, write the returned title into the field, clear the field when the lookup fails or returns no title, ignore a response for a link that is no longer in the field, and on submit save `title.trim()` without a second oEmbed request, and verify `npm test` covers a pasted accepted link filling the title, an edited title being the saved value, a failed lookup leaving the field empty until a typed title is saved, and a cleared title not calling `addTrack`

## 3. Save and import

- [ ] 3.1 Add `serializeLibrary` and `mergeLibraries` in `src/music/transfer.ts`. `serializeLibrary` returns the JSON `{ playlists }` shape `saveLibrary` already writes. `mergeLibraries` accepts only a value `parseLibrary` would accept, returns a failure for a missing string, `""`, invalid JSON, or any other shape, treats `{ "playlists": [] }` as a merge that leaves the current library unchanged, appends a new playlist id, keeps a stored playlist's name, description, and timestamps when the id matches, appends tracks whose `videoId` is new, drops a repeated `videoId`, and appends a different id that reuses a name, and verify `src/music/transfer.test.ts` passes `npm test` for each of those cases without reading storage
- [ ] 3.2 Add `importLibrary` on `MusicProvider` so a successful `mergeLibraries` result uses the same commit path as create and update, and a failure commits nothing, and verify a test passes `npm test` for an empty library gaining the file's playlists under `music-library` after reload, an existing playlist remaining when the file's ids are new, and an invalid file leaving the stored library unchanged
- [ ] 3.3 Add an `EllipsisVertical` button labeled Playlist actions, with `aria-expanded`, to the `PlaylistLibrary` bar in `src/pages/MusicPage.tsx`, including when the library is empty. Its menu offers Save Playlist and Import Playlist and closes on Escape or a second press. Save downloads `serializeLibrary` as `music-library.json` and does not call `saveLibrary`. Import uses a hidden file input with `accept="application/json,.json"`, shows a failure in the playlist section with `role="alert"`, and clears the input after each choice. The song page has no menu, and verify `src/pages/MusicPage.test.tsx` passes `npm test` for the empty library showing Playlist actions, Save Playlist, and Import Playlist, and for a save that does not change the stored playlists

## 4. Check

- [ ] 4.1 Run `npm test` and confirm the description, title, merge, and menu cases above pass together, and that `src/music/storage.test.ts` still round-trips a playlist that has a description
