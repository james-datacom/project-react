import { type Library, type LibraryResult, type Track } from './library.ts'
import { loadLibrary, parseLibrary, saveLibrary, type LibraryStorage } from './storage.ts'

export const PLAYLIST_FILE_NAME = 'music-library.json'

function failure(error: string): LibraryResult {
  return { ok: false, error }
}

function libraryFromFile(raw: string | null): LibraryResult {
  if (raw == null || raw === '') return failure('Choose a playlist file.')
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return failure('That file is not a playlist file.')
  }
  if (!value || typeof value !== 'object' || !Array.isArray((value as Library).playlists)) {
    return failure('That file is not a playlist file.')
  }
  const parsed = parseLibrary(raw)
  if (parsed.playlists.length !== (value as Library).playlists.length) {
    return failure('That file is not a playlist file.')
  }
  return { ok: true, library: parsed }
}

function mergeTracks(stored: Track[], incoming: Track[]) {
  const seen = new Set(stored.map((track) => track.videoId))
  const added = incoming.filter((track) => {
    if (seen.has(track.videoId)) return false
    seen.add(track.videoId)
    return true
  })
  if (added.length === 0) return stored
  return [...stored, ...added]
}

export function serializeLibrary(library: Library) {
  return JSON.stringify({ playlists: library.playlists })
}

export function playlistFile(library: Library) {
  return { filename: PLAYLIST_FILE_NAME, body: serializeLibrary(library) }
}

export function mergeLibraries(current: Library, raw: string | null): LibraryResult {
  const file = libraryFromFile(raw)
  if (!file.ok) return file
  if (file.library.playlists.length === 0) return { ok: true, library: current }

  const next = current.playlists.map((playlist) => playlist)
  const index = new Map(next.map((playlist, position) => [playlist.id, position]))
  for (const playlist of file.library.playlists) {
    const at = index.get(playlist.id)
    if (at === undefined) {
      index.set(playlist.id, next.length)
      next.push({ ...playlist, tracks: mergeTracks([], playlist.tracks) })
      continue
    }
    const stored = next[at]
    const tracks = mergeTracks(stored.tracks, playlist.tracks)
    if (tracks === stored.tracks) continue
    next[at] = { ...stored, tracks }
  }
  return { ok: true, library: { playlists: next } }
}

export function commitImport(storage: LibraryStorage, current: Library, raw: string | null): LibraryResult {
  const result = mergeLibraries(current, raw)
  if (!result.ok) return result
  saveLibrary(storage, result.library)
  return { ok: true, library: loadLibrary(storage) }
}
