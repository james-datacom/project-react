# Design

## Context

The shell, light and dark themes, client routes, and Vitest already exist. `src/shell/Sidebar.tsx` lists Home, a Health group whose only child is Protein Calculator, then Projects and Settings. Health is a button with `aria-expanded` and a `ChevronDown` that the existing `.nav-chevron` rule rotates. Expanded state is component state, forced open on `/health/protein-calculator`, and not stored. `src/shell/Header.tsx` maps paths to the header title. `src/App.tsx` renders those routes inside `AppShell`. Below `48rem` the sidebar is hidden until the header menu button opens an overlay. It does not collapse to an icon rail, and `src/shell/Sidebar.test.tsx` asserts that no icon rail is introduced. `src/main.tsx` uses `BrowserRouter` with a basename from `import.meta.env.BASE_URL`. The production build copies `index.html` to `dist/404.html`. Icons already come from `lucide-react`. See proposal.md for why Music is needed, and the delta specs for the behavior this design has to satisfy.

## Goals / Non-Goals

**Goals:**

- Add Entertainment with the same group behavior Health already has, without changing the other menu items.
- Keep link parsing, playlist edits, and queue order in plain functions that Vitest can run without a YouTube player.
- Keep one official player mounted for the life of a queue, so leaving `/entertainment/music` does not restart playback.
- Leave the published path URL working through the existing Pages fallback.

**Non-Goals:**

- An icon rail, a new narrow-sidebar mode, or tooltips for a collapse state this shell does not have.
- Persisting the queue, the playhead, or shuffle order across reload.
- A React wrapper package for YouTube, `HashRouter`, or a change to the Vite base path.
- Covering the official player, or blocking an advertisement that player is responsible for.

## Decisions

### Entertainment copies the Health group

Insert one more group between the Health item and Projects. Leave Home, Health, Protein Calculator, Projects, Settings, and the account row as they are.

- Entertainment is a button, so activating it does not change the page. It reuses `nav-group`, `nav-children`, `nav-child`, and `ChevronDown`. `aria-expanded` matches its open state.
- Music is the only child. It is a `NavLink` to `/entertainment/music`. Icons are Lucide `Clapperboard` and `Music`. Hover scale, accent color, and light and dark color already come from `.nav-icon` and `.nav-link[aria-current='page']`.
- Open state is a second piece of component state, independent of Health. `/entertainment/music` forces the group open, including after refresh, and the button does not collapse it while that path is current. On any other path the group starts collapsed. The choice is not stored.

A shared nav-config rewrite was rejected because Health's tests already pin the current markup, and a second copy of the same pattern is enough for one new group. A route for Entertainment itself was rejected because the spec forbids that parent from opening a page.

### No icon rail

Below `48rem` the sidebar stays hidden until the menu button opens the overlay. This change does not add a mode that shows icons without labels. The collapsed-sidebar scenario in the entertainment-menu spec applies only when an icon-only sidebar exists, and this shell does not have one. Adding a rail was rejected because it would resize the shell for every destination, and the current sidebar test forbids that rail.

### Music route on the current router

Add one child route, `entertainment/music`, rendering `src/pages/MusicPage.tsx`. Add `/entertainment/music` to the header title map as `Music`. The unknown-path redirect to `/` stays.

Do not switch to `HashRouter`. A refresh of `/project-react/entertainment/music` on Pages already receives `404.html`, which is the built app, and `BrowserRouter` reads the path. The in-app path remains `/entertainment/music`. No Vite or workflow edit is required for that fallback.

### Plain library and queue rules

New modules under `src/music/`:

- `youtube-link.ts` exports `parseYouTubeVideoUrl`. It accepts a single video id of 11 characters matching `[A-Za-z0-9_-]{11}` from `youtube.com/watch`, `www.youtube.com/watch`, `youtu.be/`, `music.youtube.com/watch`, `youtube.com/shorts/`, and `youtube.com/embed/` (with or without `www`). Extra query parameters such as `t` and `list` are ignored when `v` is present. It rejects an empty string, a playlist-only URL, a channel URL, a search URL, and any other host. The return value is the video id or an error message. It does not fetch.
- `library.ts` exports create, update, delete, add-track, and remove-track. Each takes a library and returns the next library or a field error. Names are trimmed and must be 1 to 80 characters. Descriptions are trimmed and must be at most 200 characters. Ids come from `crypto.randomUUID()`. Timestamps are `Date` values the caller passes in, stored as ISO-8601. Two playlists may share a name. Adding a track rejects a `videoId` already in that playlist and allows it in another. Delete removes that playlist only.
- `queue.ts` exports start-playlist, start-at-track, next, previous, and skip-unavailable. Repeat is `off`, `all`, or `one`. Shuffle receives a `random` function so tests do not depend on `Math.random`. With shuffle off, start-playlist begins at index 0 and start-at-track begins at the chosen row, then follows saved order. Previous at index 0 returns `restart` and does not wrap. Next at the last index stops when repeat is `off`, wraps to the first when repeat is `all` or `one`. When a track ends, repeat `one` returns `replay` for the same index. Shuffle plays each remaining id once before any of them repeats. A finished shuffle cycle stops when repeat is `off` and reshuffles when repeat is `all`. Skip-unavailable drops the current id and applies next. If every remaining id in the cycle has already failed, it returns `stop` so a player error cannot loop.

`loadLibrary` and `saveLibrary` live in `storage.ts` under the key `music-library`. The stored value is `{ playlists: [...] }` with the fields in the proposal. A missing value, invalid JSON, or a value that does not match that shape becomes `{ playlists: [] }`. The whole value is rejected rather than repaired. The queue is not written.

A class that owns both storage and the player was rejected because the specs require the rules to be testable without mounting YouTube.

### One player, owned by the shell

`MusicProvider` wraps the shell in `AppShell`. It holds the library and the in-memory queue, loads the library once on mount, and writes it after each successful edit. It does not call play on load.

`PlayerBar` is a sibling of `main`, in a third grid row of `.shell` (`grid-row: 3`, content column only). The sidebar still spans all rows. The bar stays mounted while the route is `/entertainment/music` or a queue exists, so the iframe node is not destroyed by navigation.

- On `/entertainment/music` the bar is the page's player region: title, playlist name, the full control set, and a visible iframe. The page renders only the library and the track list. Wide layout places those two side by side. At `48rem` they stack. The player row stays on screen.
- On any other route, the same bar is compact while a queue exists: the same controls at a smaller size, and a smaller iframe that is still visible. The grid row is the only layout change on Home, Health, Projects, Settings, and Account.
- With no queue and a route other than Music, the bar is not rendered and the third row is not reserved.

The official player is created by loading `https://www.youtube.com/iframe_api` once and constructing `YT.Player` on a div inside the bar. A small local type covers `playVideo`, `pauseVideo`, `seekTo`, `setVolume`, `mute`, `unMute`, `getCurrentTime`, and `getDuration`. No `@types/youtube` package and no third-party player component. `playerVars` are `controls: 0`, `rel: 0`, `playsinline: 1`, and `origin` set to `window.location.origin`. The iframe keeps a real width and height in both sizes. Nothing is positioned over it. App controls call the player API. A 250ms timer updates the seek bar while playing.

`onError` marks that row unavailable, shows the error on the row, and runs skip-unavailable. `onStateChange` for ended runs the end-of-track rule. Deleting the playing playlist, or removing the last remaining song, destroys the player and clears the queue. Removing the current song otherwise advances with next.

An npm package such as `react-youtube` was rejected because the page would still need the same queue rules, and a second abstraction does not remove the script. Mounting the iframe only inside `MusicPage` was rejected because unmounting it on the way to Home would stop playback.

### Titles, dialogs, and ads

Add song sends the original URL to `https://www.youtube.com/oembed?url=<encoded>&format=json` only when the title is blank. The saved title is the `title` field. A failed request or a missing title leaves the song unsaved and asks the user to type one. A provided title skips the request.

Create, edit, and delete use `<dialog>`. Delete does nothing until confirm. Add song shows its parse or duplicate error under the field and writes nothing. The Music page, dialogs, and player bar contain no ad markup. `index.html` does not gain an ad script. Playback does not fetch a media file, and the app does not call youtube-dl, yt-dlp, Invidious, or Piped.

Colors use the existing theme variables. No new palette and no Spotify mark.

### Tests without the player

Vitest already runs from `npm test`. New tests sit next to the pure modules:

- `youtube-link.test.ts` covers each accepted form in the music-library spec, extra `t` and `list` parameters, and the rejected cases.
- `library.test.ts` covers trim and length limits, shared names, edit isolation, confirmed delete, duplicate video ids, remove, round-trip of the stored shape, and an invalid stored value.
- `queue.test.ts` covers start, start-at, previous on the first song, next on the last song for each repeat mode, end-of-track repeat one, shuffle with an injected `random`, and skip-unavailable including a cycle where every song fails.

Extend `Sidebar.test.tsx` for Entertainment's order, a collapsed child, and the forced-open selected Music child with the header title `Music`. Keep the assertion that the stylesheet has no icon rail. Do not mount `YT.Player` in unit tests. A static render of the empty Music page can follow `ProteinCalculatorPage.test.tsx`.

## Risks / Trade-offs

- [The official player can still show an advertisement] → That presentation belongs to YouTube. This app does not add a slot, and it does not cover the iframe to hide one. The iframe stays at a real size.
- [oEmbed can fail from the browser] → The song stays unsaved until the user types a title, which is the spec's failure path. A provided title never depends on that request.
- [The iframe API script can be blocked] → The library still loads and saves. The player region shows that playback is unavailable and does not fall back to a direct media URL.
- [Recreating the iframe on every route would stop audio] → `PlayerBar` stays mounted for the life of the queue, and only its size class changes.
- [A run of unavailable videos could advance forever] → skip-unavailable stops after every id in the current cycle has failed.
- [Corrupt `music-library` data] → The loader replaces it with an empty library. Partial repair was rejected because a half-read playlist is worse than the empty state.
- [The icon-only tooltip scenario is not exercised] → This shell has no icon-only sidebar. Building one would change every destination and fail the current sidebar test.
- [Queue state dies on reload] → The spec requires restore of the library and forbids autoplay. Playback position is session-only.

## Migration Plan

1. Add the music modules and their tests, the provider, the player bar, the page, the route, the header title, and the Entertainment group.
2. Confirm `npm test` and `npm run build` succeed. The build still emits `dist/404.html`.
3. Merging to `main` publishes through the existing workflow. No Pages setting changes.
4. To roll back, revert the commit. A leftover `music-library` key in the browser is unused after rollback and does not affect other pages. A failed test or build leaves the last good Pages deploy in place.

## Open Questions

None. The menu pattern, the single shell-owned player, the storage key, and the decision not to add an icon rail are settled above.
