# Proposal

## Why

The app can navigate and estimate protein, but it has no place to keep music or play it. An Entertainment section with a Music page lets someone build playlists from YouTube links and listen in this app's own player, without leaving the shell or adding advertisements of this product's own.

## What Changes

- Add an **Entertainment** parent directly under the Health group and above Projects. It expands and collapses its children, with a chevron that shows and rotates with that state. When the sidebar is collapsed, only the Entertainment icon shows, with a tooltip for the menu name.
- Add a **Music** child under Entertainment. Selecting it opens `/entertainment/music`. While that page is current, Entertainment stays expanded and Music is the selected item. Icons come from the existing Lucide set and match the other menu items. Do not restyle Home, Health, Projects, Settings, or Account.
- Add a Music page titled **Music**, with three regions: a playlist library, the selected playlist's tracks, and the app player. The layout works on desktop, tablet, and mobile, and in light and dark mode, using the existing theme tokens. Do not introduce a separate green theme or copy Spotify's logo, name, or artwork. The route must still load on the existing GitHub Pages site.
- Let the user create, rename, and delete playlists. A name is required (trimmed, at most 80 characters). A description is optional (at most 200 characters). Two playlists may share a name. Delete asks for confirmation and removes that playlist and its songs. Deleting the playlist that is playing clears the player. The first visit shows an empty library with a short line and a **New playlist** action.
- Let the user add and remove songs on the selected playlist by pasting one YouTube video link. Accept watch, youtu.be, music.youtube.com, shorts, and embed URLs, and ignore extra query parameters on a watch URL. Reject a channel, a playlist-only URL, a search URL, an empty value, or any host that is not YouTube. The same video cannot be added twice to the same playlist. A title is optional and is filled from YouTube's oEmbed response when the user leaves it blank; if that lookup fails, a title is required before save. Remove deletes that song only. If it was playing, the queue advances, or stops when the playlist is now empty.
- Store the library in the browser under `localStorage` key `music-library`. Each playlist and song has its own id and ISO-8601 timestamps. A missing or invalid stored value starts as an empty library. There is no backend, account sync, or file upload.
- Play the queue in a player that belongs to this app. Playback uses the official YouTube IFrame Player API, mounted in the player and controlled by this app. Visible controls are play, pause, previous, next, seek, volume, mute, repeat (off, all, one), and shuffle. The now-playing area shows the song title and the playlist name. The page never navigates to YouTube and never shows the YouTube watch page. An empty playlist cannot be played. If a video is unavailable, the row shows an error and the queue moves on. Previous on the first song restarts it. Next on the last song stops unless repeat is on.
- While a queue is active, keep a compact player bar at the bottom of the app shell on other routes so playback can continue. Leaving `/entertainment/music` does not wipe the queue. Reloading restores the library and does not autoplay.
- The Music page, player bar, and playlist dialogs contain no advertisement, sponsor slot, banner, or skip-ad control. The app does not load an ad network, implement ad blocking or stream ripping, or hide the official player to conceal an advertisement. A YouTube link is only the identity of the song.
- Out of scope: accounts and sync, audio upload or download, YouTube search or recommendations, lyrics, sharing, Spotify's API or catalog, payments, and suppressing advertisements that YouTube's official player is responsible for.

## Capabilities

### New Capabilities

- `entertainment-menu`: Entertainment as an expandable parent under Health and above Projects, the Music child, collapsed-sidebar tooltip, and selection that keeps Entertainment open on `/entertainment/music`.
- `music-library`: The Music page regions, playlist create/edit/delete, adding and removing songs from accepted YouTube links, oEmbed titles, and browser persistence of the library.
- `music-player`: In-app queue playback and transport controls, repeat and shuffle, the compact player bar on other routes, and the rule that this product adds no advertisements of its own.

### Modified Capabilities

None. `openspec list --specs` is empty. Sidebar behavior for Home, Health, Projects, and Settings lives only on in-progress changes (`navigation`, `health-menu`), not under `openspec/specs/`.

## Impact

- Extends the sidebar in `src/shell/Sidebar.tsx`, the header title map in `src/shell/Header.tsx`, and the routes in `src/App.tsx` with `/entertainment/music`. A new page module owns the library, track list, and player. Playlist, link-parsing, and queue rules stay in plain functions, covered by unit tests without mounting the YouTube player.
- The shell reserves space for a compact player bar while a queue is active. Home, Health, Projects, Settings, and Account keep their current behavior aside from that reserved space.
- Playback depends on the official YouTube IFrame Player API. Song titles may call YouTube's public oEmbed endpoint. No new backend, database, or account API. Do not add youtube-dl, yt-dlp, Invidious, Piped, or a direct media URL.
- Light and dark mode already exist; the new menu and page use them. Publishing stays on the existing GitHub Pages workflow. This change does not add a deploy pipeline.
