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

function validatePlaylistName(name: string): LibraryFailure | { name: string } {
  const trimmed = name.trim()
  if (!trimmed) return failure('Name is required.')
  if (trimmed.length > 80) return failure('Name must be 80 characters or fewer.')
  return { name: trimmed }
}

export function createPlaylist(
  library: Library,
  draft: PlaylistDraft,
  meta: { id: string; now: string },
): LibraryResult {
  const text = validatePlaylistName(draft.name)
  if ('ok' in text) return text
  const playlist: Playlist = {
    id: meta.id,
    name: text.name,
    description: '',
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
  const text = validatePlaylistName(draft.name)
  if ('ok' in text) return text
  let found = false
  const playlists = library.playlists.map((playlist) => {
    if (playlist.id !== playlistId) return playlist
    found = true
    return {
      ...playlist,
      name: text.name,
      description: playlist.description,
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

export const SAVED_SONGS_PLAYLIST_ID = 'search-saved'

export function saveSearchedSong(
  library: Library,
  song: { videoId: string; title: string; trackId: string; now: string },
): Library {
  const alreadySaved = library.playlists.some((playlist) =>
    playlist.tracks.some((track) => track.videoId === song.videoId),
  )
  if (alreadySaved) return library
  const track: Track = {
    id: song.trackId,
    youtubeUrl: `https://www.youtube.com/watch?v=${song.videoId}`,
    videoId: song.videoId,
    title: song.title,
    addedAt: song.now,
  }
  const saved = library.playlists.find((playlist) => playlist.id === SAVED_SONGS_PLAYLIST_ID)
  if (!saved) {
    return {
      playlists: [
        ...library.playlists,
        {
          id: SAVED_SONGS_PLAYLIST_ID,
          name: 'Saved songs',
          description: '',
          createdAt: song.now,
          updatedAt: song.now,
          tracks: [track],
        },
      ],
    }
  }
  return {
    playlists: library.playlists.map((playlist) =>
      playlist.id === SAVED_SONGS_PLAYLIST_ID
        ? { ...playlist, updatedAt: song.now, tracks: [...playlist.tracks, track] }
        : playlist,
    ),
  }
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
