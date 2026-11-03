import { emptyLibrary, type Library, type Playlist, type Track } from './library.ts'

export const MUSIC_LIBRARY_KEY = 'music-library'

export type LibraryStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

function isTrack(value: unknown): value is Track {
  if (!value || typeof value !== 'object') return false
  const track = value as Track
  return (
    typeof track.id === 'string' &&
    typeof track.youtubeUrl === 'string' &&
    typeof track.videoId === 'string' &&
    track.videoId.length === 11 &&
    typeof track.title === 'string' &&
    typeof track.addedAt === 'string'
  )
}

function isPlaylist(value: unknown): value is Playlist {
  if (!value || typeof value !== 'object') return false
  const playlist = value as Playlist
  return (
    typeof playlist.id === 'string' &&
    typeof playlist.name === 'string' &&
    typeof playlist.description === 'string' &&
    typeof playlist.createdAt === 'string' &&
    typeof playlist.updatedAt === 'string' &&
    Array.isArray(playlist.tracks) &&
    playlist.tracks.every(isTrack)
  )
}

export function parseLibrary(raw: string | null): Library {
  if (!raw) return emptyLibrary
  try {
    const value = JSON.parse(raw) as unknown
    if (!value || typeof value !== 'object' || !Array.isArray((value as Library).playlists)) {
      return emptyLibrary
    }
    const playlists = (value as Library).playlists
    if (!playlists.every(isPlaylist)) return emptyLibrary
    return { playlists }
  } catch {
    return emptyLibrary
  }
}

export function loadLibrary(storage: LibraryStorage): Library {
  try {
    return parseLibrary(storage.getItem(MUSIC_LIBRARY_KEY))
  } catch {
    return emptyLibrary
  }
}

export function saveLibrary(storage: LibraryStorage, library: Library) {
  storage.setItem(MUSIC_LIBRARY_KEY, JSON.stringify(library))
}
