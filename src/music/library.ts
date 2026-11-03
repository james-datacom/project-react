export type Track = {
  id: string
  youtubeUrl: string
  videoId: string
  title: string
  addedAt: string
}

export type Playlist = {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  tracks: Track[]
}

export type Library = {
  playlists: Playlist[]
}

export const emptyLibrary: Library = { playlists: [] }

export type LibrarySuccess = { ok: true; library: Library }
export type LibraryFailure = { ok: false; error: string }
export type LibraryResult = LibrarySuccess | LibraryFailure

export type PlaylistDraft = {
  name: string
  description?: string
}

export type TrackDraft = {
  id: string
  youtubeUrl: string
  videoId: string
  title: string
  addedAt: string
}

function failure(error: string): LibraryFailure {
  return { ok: false, error }
}

function validatePlaylistText(draft: PlaylistDraft): LibraryFailure | { name: string; description: string } {
  const name = draft.name.trim()
  const description = (draft.description ?? '').trim()
  if (!name) return failure('Name is required.')
  if (name.length > 80) return failure('Name must be 80 characters or fewer.')
  if (description.length > 200) return failure('Description must be 200 characters or fewer.')
  return { name, description }
}

export function createPlaylist(
  library: Library,
  draft: PlaylistDraft,
  meta: { id: string; now: string },
): LibraryResult {
  const text = validatePlaylistText(draft)
  if ('ok' in text) return text
  const playlist: Playlist = {
    id: meta.id,
    name: text.name,
    description: text.description,
    createdAt: meta.now,
    updatedAt: meta.now,
    tracks: [],
  }
  return { ok: true, library: { playlists: [...library.playlists, playlist] } }
}

export function updatePlaylist(
  library: Library,
  playlistId: string,
  draft: PlaylistDraft,
  now: string,
): LibraryResult {
  const text = validatePlaylistText(draft)
  if ('ok' in text) return text
  let found = false
  const playlists = library.playlists.map((playlist) => {
    if (playlist.id !== playlistId) return playlist
    found = true
    return {
      ...playlist,
      name: text.name,
      description: text.description,
      updatedAt: now,
    }
  })
  if (!found) return failure('Playlist not found.')
  return { ok: true, library: { playlists } }
}

export function deletePlaylist(library: Library, playlistId: string): LibraryResult {
  if (!library.playlists.some((playlist) => playlist.id === playlistId)) {
    return failure('Playlist not found.')
  }
  return {
    ok: true,
    library: {
      playlists: library.playlists.filter((playlist) => playlist.id !== playlistId),
    },
  }
}

export function addTrack(library: Library, playlistId: string, track: TrackDraft, now: string): LibraryResult {
  let found = false
  let duplicate = false
  const playlists = library.playlists.map((playlist) => {
    if (playlist.id !== playlistId) return playlist
    found = true
    if (playlist.tracks.some((item) => item.videoId === track.videoId)) {
      duplicate = true
      return playlist
    }
    return {
      ...playlist,
      updatedAt: now,
      tracks: [...playlist.tracks, track],
    }
  })
  if (!found) return failure('Playlist not found.')
  if (duplicate) return failure('That video is already in this playlist.')
  return { ok: true, library: { playlists } }
}

export function removeTrack(library: Library, playlistId: string, trackId: string, now: string): LibraryResult {
  let found = false
  let removed = false
  const playlists = library.playlists.map((playlist) => {
    if (playlist.id !== playlistId) return playlist
    found = true
    const tracks = playlist.tracks.filter((track) => track.id !== trackId)
    removed = tracks.length !== playlist.tracks.length
    return { ...playlist, updatedAt: now, tracks }
  })
  if (!found || !removed) return failure('Song not found.')
  return { ok: true, library: { playlists } }
}
