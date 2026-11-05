# Proposal

## Why

The Music Search tab is only an empty page, so the only way to add a song is to paste a YouTube link. People need a search field that finds songs on YouTube and shows each one with its artwork and title.

## What Changes

- Fill the existing Search page at `/entertainment/music/search` with the search screen from the story and the attached mockup. The header title stays **Search**. Home, Create, playback, and the mini player stay as they are.
- Add a search field with the placeholder **What do you want to listen to?** and a **Cancel** action beside it. Cancel clears the field and returns the page to recent searches.
- With an empty field, show **Recent searches**: the songs, artists, and playlists the user has looked up on this device. Each row shows artwork, a title, and a short type line (Song, Artist, or Playlist). A song row also names the artist. Song and playlist artwork is square; an artist uses a round avatar.
- When the user types a query, replace that list with matching results from YouTube. Every result shows artwork and a title, the same way recent searches do.
- Each row has an add action. A song that is not in the library yet can be saved from that action. A row that is already saved shows a check instead of add. Removing a recent-search row drops it from recent searches only and does not delete it from the library.
- The in-page **Search music** filter on the Music library stays a filter of saved playlists and songs. This change does not replace it.
- Out of scope: starting playback from a search row, accounts and sync, audio download, recommendations beyond the typed query, and any change to the player, the mini player, or the now-playing view.

## Capabilities

### New Capabilities

- `music-search`: The Search page field, Cancel, recent searches, and YouTube results with artwork, title, and type, including add, already-added, and remove.

### Modified Capabilities

None. `openspec list --specs` is empty. Saving a song still belongs to `music-library` on the completed `music-player` change, not under `openspec/specs/`. This change adds one way in: a song result can be saved into that library. The specs artifact will include a `music-library` delta for that requirement, reusing that capability path. Playlist create, pasted links, and playback requirements do not change.

## Impact

- `src/pages/MusicSearchPage.tsx` is an empty section today. It becomes the search screen. The route `/entertainment/music/search`, the Search tab in `src/music/MusicTabBar.tsx`, and the Search header title already exist.
- Saving a song reuses the music library in `src/music/library.ts` and `src/music/MusicProvider.tsx`. Recent searches stay on this device. No new backend or account API.
- YouTube results need a search lookup in addition to the existing oEmbed title lookup. Playback stays on the official YouTube IFrame Player API. Do not add youtube-dl, yt-dlp, Invidious, Piped, or a direct media URL.
- The Music page filter in `src/pages/MusicPage.tsx` is unchanged. Light and dark mode already exist; the search screen uses them.
