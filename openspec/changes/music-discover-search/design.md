# Design

## Context

`/entertainment/music/search` already renders `MusicSearchPage`, which returns an empty `<section aria-label="Search" />`. The Search tab and the header title Search are already wired. Songs live only as tracks on playlists in `src/music/library.ts`, saved through `MusicProvider.addTrack` under the `music-library` key. The app can resolve a known video title with `fetchYouTubeTitle` (`src/music/oembed.ts`). It cannot search. See proposal.md for why, and `specs/music-search/spec.md` plus `specs/music-library/spec.md` for the behavior this design has to meet.

## Goals / Non-Goals

**Goals:**

- Keep search parsing, recent-search merge, and “save this video once” in plain functions that Vitest can run without a browser or a live YouTube call.
- Leave the `music-library` record shape unchanged so a library saved before this change still loads.
- Add a song from search through the existing commit path, and do not touch the player session.

**Non-Goals:**

- A backend, a search proxy, or a new npm dependency.
- Changing the Music page filter, playback, the mini player, or the now-playing view.
- Playing a row, opening YouTube, or importing a YouTube playlist’s tracks.

## Decisions

### Search uses the YouTube Data API

`src/music/youtube-search.ts` calls

`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video,channel,playlist&maxResults=10&q=<encoded>&key=<key>`

with an injected `fetch`, the same pattern as `fetchYouTubeTitle`. The key is `import.meta.env.VITE_YOUTUBE_API_KEY`. It is not committed. A missing key, a non-OK response, or a thrown fetch is a failed lookup. `items: []` is an empty match. Anything else is parsed and items without a title or an id are dropped.

Mapping:

- `youtube#video` → song. `id` is `id.videoId`, title is `snippet.title`, artist is `snippet.channelTitle`, artwork is the medium thumbnail or the default thumbnail.
- `youtube#channel` → artist. `id` is `id.channelId`, title is `snippet.channelTitle` or `snippet.title`, no artist line.
- `youtube#playlist` → playlist. `id` is `id.playlistId`, title is `snippet.title`, no artist line.

Scraping the YouTube results page, and Invidious, Piped, or youtube-dl, were rejected. oEmbed cannot search. A proxy was rejected because this app has no server.

### The page asks after the field settles

`MusicSearchPage` holds the query in state. A value that is empty after trimming shows recent searches and does not fetch. Otherwise the page waits 300ms after the last change, then requests that trimmed query. A response for a query that is no longer in the field is ignored. Cancel sets the query to `''` and does not write storage except what a successful response already stored.

The page takes an optional `search` function and an optional recent-search storage so tests can render it without the network. Defaults are the Data API helper and `localStorage`. The section keeps `aria-label="Search"`.

The row is not a link. Add, the added check, and remove are the only controls. Song and playlist artwork is square. Artist artwork is a circle. Labels are Song, Artist, and Playlist. A song line is `Song • <artist>`. Icons are the existing Lucide `Plus`, `Check`, and `X`. Color comes from the current theme tokens, including the check. No separate green is added.

### Recent searches are their own storage key

`src/music/search-history.ts` stores `{ items }` under `music-search-recents`. An item is the parsed hit plus `added` for an artist or a playlist. A missing or invalid value is an empty list. This key is not inside `music-library`, so `parseLibrary` does not change.

A successful response is merged immediately: each hit is moved to the front, matched by kind and id, so a repeat appears once. The list is capped at 50. An empty or failed lookup does not change the stored list. Remove deletes that one item. Reload reads the key again. The query itself is not stored and is not put in the URL.

Putting recents inside `music-library` was rejected because a new field on that value would make the current parser treat the library as empty.

### A song is saved once, onto one playlist

`saveSearchedSong` in `library.ts` takes the library, the video id, and the row title. If any playlist already has that video id, it returns the same library and saves nothing. Otherwise it finds the playlist with id `search-saved`, or appends one named **Saved songs** with that id, an empty description, and the usual timestamps. The track is that playlist’s existing track shape: a new id, `https://www.youtube.com/watch?v=<videoId>`, the video id, the row title, and an ISO-8601 `addedAt`.

`MusicProvider` exposes `saveSearchedSong` and commits with the same `saveLibrary` path as `addTrack`. It does not call `playPlaylist`, `playTrack`, or `issue`. The Search row shows the check when the video id is already on any playlist, so the check follows the library rather than a flag on the recent item.

An artist or playlist add sets `added` on that stored item and on the row on screen. It does not call `saveSearchedSong`.

Appending onto whichever playlist happens to be selected was rejected because Search has no selected playlist on screen, and it would mix discovered songs into a playlist the user did not choose. A second copy on another playlist was rejected because the spec says a video already in the library is not saved again from Search. Paste-to-add on a playlist is unchanged and can still place the same video on a different playlist.

## Risks / Trade-offs

- [The Data API key is visible in the static bundle and search.list spends quota] → The key stays in the environment, restricted by HTTP referrer. The page does not search an empty field, waits 300ms, and asks for 10 results. Without a key, the page shows the failed-lookup error and does not invent rows.
- [A slow response can belong to an older query] → The page applies a response only when its query is still the field value.
- [Recent searches drop the oldest past 50] → The cap keeps `music-search-recents` small. The latest response is still the front of the list, and a repeated hit stays a single row.
- [Deleting the Saved songs playlist removes those tracks] → The next song add creates the playlist again. A video that is still on another playlist keeps the check.
- [The tab-bar test expects an empty Search section] → The section label stays. That test’s “empty page” assertion has to expect the field instead.

## Migration Plan

No change to the `music-library` shape and no deploy pipeline change. Set `VITE_YOUTUBE_API_KEY` for the build that should return live results. Existing libraries load as they do now. The Saved songs playlist appears only after the user adds a song from Search. Rollback is reverting the page and the provider method. The `music-search-recents` key and a Saved songs playlist already written remain valid data for the previous build: the key is ignored, and the playlist is an ordinary playlist.
