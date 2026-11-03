# Story

Music player inspired by Spotify

## User story

**As a** user of the web app,
**I want** an Entertainment menu in the sidebar with a Music page where I can keep playlists of songs added from YouTube links and play them in the app's own player,
**So that** I can organize and listen to music without leaving the app or seeing advertisements added by this product.

## Scope

1. Add a parent menu named **Entertainment** to the sidebar, with a child item **Music** and a Music page at `/entertainment/music`.
2. Create, rename, and delete playlists.
3. Add and remove songs in a playlist. A song is added by pasting a YouTube link.
4. Play the queue in a player that belongs to this app: transport controls, progress, volume, and the current track.
5. The app does not include advertisements. It does not add ad slots, and it does not play ads of its own.

This is a static React app. Playlists live in the browser. There is no backend, account sync, or file upload.

## Sidebar

| Order | Menu               | Type  | Icon (suggested) | Route                         |
|-------|--------------------|-------|------------------|-------------------------------|
| 1     | Home               | Item  | House            | `/`                           |
| 2     | Health             | Parent| Heart / Pulse    | —                             |
| 2.1   | Protein Calculator | Child | Calculator       | `/health/protein-calculator`  |
| 3     | Entertainment      | Parent| Clapperboard     | —                             |
| 3.1   | Music              | Child | Music note       | `/entertainment/music`        |
| …     | Existing menus     | Item  | Unchanged        | Existing routes               |

Entertainment sits directly under the Health group and above Projects. Music is its only child. Use the existing icon library (Lucide). Do not restyle the other menu items.

## Acceptance criteria

### Sidebar — Entertainment menu

- [ ] **Entertainment** appears directly below the Health group and above Projects.
- [ ] Clicking **Entertainment** expands or collapses its child items.
- [ ] A chevron shows the expanded or collapsed state and rotates when toggled.
- [ ] **Music** appears indented under **Entertainment**, with an icon before the label.
- [ ] Clicking **Music** opens `/entertainment/music`.
- [ ] When the Music page is active, **Entertainment** stays expanded and **Music** is highlighted as active.
- [ ] Entertainment and Music icons match the other menu icons: same library, hover behavior, active color, and light and dark mode.
- [ ] When the sidebar is collapsed, only the Entertainment icon shows, with a tooltip for the menu name.

### Music page

- [ ] The header title on `/entertainment/music` is **Music**.
- [ ] The header title on that route is **Music**.
- [ ] The page has three regions: a playlist library, the selected playlist's tracks, and the app player.
- [ ] The layout works on desktop, tablet, and mobile. On a narrow screen the library and track list stack, and the player stays reachable.
- [ ] Light and dark mode both use the existing theme tokens. Do not introduce a separate Spotify green theme or copy Spotify's logo, name, or artwork.
- [ ] The route works on GitHub Pages with the app's existing router setup.

### Playlists — create, edit, delete

- [ ] The library lists every saved playlist. The first visit shows an empty state with a short line and a **New playlist** action.
- [ ] **New playlist** asks for a name and an optional description.
- [ ] Name is required, trimmed, and limited to 80 characters. Description is optional and limited to 200 characters.
- [ ] Two playlists may share a name. Each playlist has its own id.
- [ ] **Edit** changes the name and description of the selected playlist and no other playlist.
- [ ] **Delete** asks for confirmation, then removes that playlist and its songs.
- [ ] Deleting the playlist that is currently playing clears the player.
- [ ] Selecting a playlist shows its name, description, and tracks.
- [ ] Playlist changes are still there after a reload.

### Songs — add and remove

- [ ] The selected playlist has **Add song**. The user pastes one YouTube link.
- [ ] The title field is optional. When it is left blank, the app fills it from YouTube's oEmbed response for that link (`https://www.youtube.com/oembed?url=...&format=json`). When oEmbed fails, the user must type a title before the song can be saved.
- [ ] A saved song stores a generated id, the original URL, the 11-character video id, the title, and the time it was added.
- [ ] The same video cannot be added twice to the same playlist. It can exist in a different playlist.
- [ ] An invalid link is rejected with an inline message. Nothing is saved.
- [ ] Each track row shows the title and a **Remove** action.
- [ ] **Remove** deletes that song only. If it was playing, the player advances to the next song, or stops when the playlist is now empty.
- [ ] Song changes are still there after a reload.

### Accepted YouTube links

Accept only a single video link. Reject a channel, a playlist URL, a search URL, an empty value, or any host that is not YouTube.

| Input | Result |
|-------|--------|
| `https://www.youtube.com/watch?v=VIDEO_ID` | Accept `VIDEO_ID` |
| `https://youtube.com/watch?v=VIDEO_ID` | Accept `VIDEO_ID` |
| `https://youtu.be/VIDEO_ID` | Accept `VIDEO_ID` |
| `https://music.youtube.com/watch?v=VIDEO_ID` | Accept `VIDEO_ID` |
| `https://www.youtube.com/shorts/VIDEO_ID` | Accept `VIDEO_ID` |
| `https://www.youtube.com/embed/VIDEO_ID` | Accept `VIDEO_ID` |
| Extra query parameters such as `t` or `list` on a watch URL | Accept the video id and ignore the other parameters |
| Playlist-only, channel, or non-YouTube URL | Reject |

`VIDEO_ID` is the 11-character YouTube id.

### Own music player

- [ ] The player is part of this app. The page never navigates to YouTube and never shows the YouTube watch page.
- [ ] Playback uses the official YouTube IFrame Player API, mounted in the player and controlled by this app.
- [ ] The visible controls belong to the app: play, pause, previous, next, a seek bar, volume, and mute.
- [ ] The now-playing area shows the song title and the playlist name.
- [ ] **Play** on a playlist starts at the first song. **Play** on a row starts at that song and continues through the rest of the playlist.
- [ ] Previous and next follow the playlist order. Previous on the first song restarts that song. Next on the last song stops, unless repeat is on.
- [ ] Repeat cycles through off, repeat all, and repeat one. Shuffle plays the remaining songs in a random order without repeating a song until the cycle ends.
- [ ] An empty playlist cannot be played. The play control is disabled.
- [ ] If the official player reports that a video is unavailable, the row shows an error and the queue moves to the next song.
- [ ] While a queue is active, a compact player bar stays at the bottom of the app shell on other routes so playback can continue. It uses the same controls at a smaller size and does not change the layout of Home, Health, Projects, Settings, or Account beyond reserving space for that bar.
- [ ] Leaving `/entertainment/music` does not wipe the queue. Reloading the page restores the library, but it does not autoplay.

### No advertisements

- [ ] The Music page, the player bar, and the playlist dialogs contain no advertisement, sponsor slot, banner, or "skip ad" control.
- [ ] The app does not load an ad network or render an ad component.
- [ ] The app does not implement ad blocking, ad skipping, or stream ripping. Do not use youtube-dl, yt-dlp, Invidious, Piped, or a direct media URL to avoid YouTube's player.
- [ ] Do not cover, crop, or hide the official player in order to conceal an advertisement. The app's own chrome is the transport and the library, not an overlay on top of an ad.
- [ ] A YouTube link is only the identity of the song. This product does not insert ads before, during, or after a song.

## Saved data

Store the library in `localStorage` under the key `music-library`.

```json
{
  "playlists": [
    {
      "id": "playlist-id",
      "name": "Focus",
      "description": "Quiet tracks",
      "createdAt": "2026-11-03T00:00:00.000Z",
      "updatedAt": "2026-11-03T00:00:00.000Z",
      "tracks": [
        {
          "id": "track-id",
          "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "videoId": "dQw4w9WgXcQ",
          "title": "Example title",
          "addedAt": "2026-11-03T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

- Ids are unique strings generated in the browser.
- Timestamps are ISO-8601.
- If the stored value is missing or invalid, start with an empty library.
- Playlist and playback rules live in plain functions that can be unit tested without mounting the YouTube player.

## Out of scope

- Accounts, sign-in, and syncing playlists across devices
- Uploading audio files, recording, or downloading YouTube media
- Search against YouTube, recommendations, radio, or a public catalog
- Lyrics, comments, sharing links, and collaborative playlists
- Spotify's API, branding, or catalog
- Payments, subscriptions, and any advertising
- Removing or suppressing advertisements that YouTube's official player is responsible for

## Definition of done

- [ ] Entertainment is in the sidebar, Music is its child, and `/entertainment/music` renders inside the existing shell.
- [ ] A user can create, edit, and delete a playlist, and the change survives reload.
- [ ] A user can add a song from an accepted YouTube link and remove it from that playlist.
- [ ] The app's player can play, pause, seek, change volume, and move through the queue.
- [ ] The player UI has no advertisement of its own, and playback does not depend on an unofficial stream extractor.
- [ ] Unit tests cover YouTube link parsing, playlist create/edit/delete, add/remove song, duplicate rejection, and next/previous/repeat/shuffle.
- [ ] Light mode, dark mode, and a narrow viewport were checked on the Music page.
- [ ] Existing Home, Health, Projects, Settings, and Account routes still behave as before.
