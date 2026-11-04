import { describe, expect, it } from 'vitest'
import { emptyLibrary, type Library, type Playlist, type Track } from './library.ts'
import { loadLibrary, MUSIC_LIBRARY_KEY, type LibraryStorage } from './storage.ts'
import { commitImport, mergeLibraries, playlistFile, serializeLibrary } from './transfer.ts'

function memoryStorage(initial?: string): LibraryStorage & { values: Map<string, string> } {
  const values = new Map<string, string>()
  if (initial !== undefined) values.set(MUSIC_LIBRARY_KEY, initial)
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
}

function track(id: string, videoId: string, title: string): Track {
  return {
    id,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
    title,
    addedAt: '2026-11-03T00:00:00.000Z',
  }
}

function playlist(id: string, name: string, tracks: Track[], description = ''): Playlist {
  return {
    id,
    name,
    description,
    createdAt: '2026-11-03T00:00:00.000Z',
    updatedAt: '2026-11-03T00:00:00.000Z',
    tracks,
  }
}

function library(playlists: Playlist[]): Library {
  return { playlists }
}

describe('playlist transfer', () => {
  it('serializes the stored playlist shape', () => {
    const stored = library([playlist('p1', 'Focus', [track('t1', 'dQw4w9WgXcQ', 'Example title')], 'Quiet tracks')])
    expect(JSON.parse(serializeLibrary(stored))).toEqual(stored)
    expect(playlistFile(stored).filename).toBe('music-library.json')
  })

  it('rejects a missing, empty, or invalid file', () => {
    const current = library([playlist('p1', 'Focus', [])])
    expect(mergeLibraries(current, null).ok).toBe(false)
    expect(mergeLibraries(current, '').ok).toBe(false)
    expect(mergeLibraries(current, 'not json').ok).toBe(false)
    expect(mergeLibraries(current, JSON.stringify({ playlists: [{ id: 'p2' }] })).ok).toBe(false)
    expect(mergeLibraries(current, JSON.stringify({ nope: true })).ok).toBe(false)
  })

  it('leaves the current library unchanged for an empty playlist file', () => {
    const current = library([playlist('p1', 'Focus', [])])
    const merged = mergeLibraries(current, JSON.stringify({ playlists: [] }))
    expect(merged).toEqual({ ok: true, library: current })
  })

  it('appends a new playlist id and a same name with a different id', () => {
    const current = library([playlist('p1', 'Focus', [], 'Quiet tracks')])
    const incoming = library([
      playlist('p2', 'Focus', [track('t1', 'dQw4w9WgXcQ', 'Example title')]),
    ])
    const merged = mergeLibraries(current, serializeLibrary(incoming))
    expect(merged.ok).toBe(true)
    if (!merged.ok) return
    expect(merged.library.playlists.map((item) => item.id)).toEqual(['p1', 'p2'])
    expect(merged.library.playlists.map((item) => item.name)).toEqual(['Focus', 'Focus'])
    expect(merged.library.playlists[0]).toEqual(current.playlists[0])
  })

  it('keeps the stored playlist and merges tracks by video id', () => {
    const current = library([
      playlist('p1', 'Focus', [track('t1', 'dQw4w9WgXcQ', 'Example title')], 'Quiet tracks'),
    ])
    const incoming = library([
      playlist(
        'p1',
        'Renamed in file',
        [track('t9', 'dQw4w9WgXcQ', 'Duplicate'), track('t2', 'abcdefghijk', 'Second')],
        'From file',
      ),
    ])
    const merged = mergeLibraries(current, serializeLibrary(incoming))
    expect(merged.ok).toBe(true)
    if (!merged.ok) return
    expect(merged.library.playlists).toHaveLength(1)
    expect(merged.library.playlists[0]).toMatchObject({
      id: 'p1',
      name: 'Focus',
      description: 'Quiet tracks',
      createdAt: current.playlists[0].createdAt,
      updatedAt: current.playlists[0].updatedAt,
    })
    expect(merged.library.playlists[0].tracks.map((item) => item.videoId)).toEqual(['dQw4w9WgXcQ', 'abcdefghijk'])
  })

  it('stores a merged library under music-library and reloads it', () => {
    const storage = memoryStorage()
    const incoming = library([playlist('p2', 'Imported', [track('t1', 'dQw4w9WgXcQ', 'Example title')])])
    const stored = commitImport(storage, emptyLibrary, serializeLibrary(incoming))
    expect(stored.ok).toBe(true)
    if (!stored.ok) return
    expect(loadLibrary(storage)).toEqual(stored.library)
    expect(stored.library.playlists.map((item) => item.id)).toEqual(['p2'])
  })

  it('keeps an existing playlist when the file uses new ids', () => {
    const current = library([playlist('p1', 'Focus', [])])
    const storage = memoryStorage(serializeLibrary(current))
    const incoming = library([playlist('p2', 'Imported', [])])
    const stored = commitImport(storage, current, serializeLibrary(incoming))
    expect(stored.ok).toBe(true)
    if (!stored.ok) return
    expect(loadLibrary(storage).playlists.map((item) => item.id)).toEqual(['p1', 'p2'])
  })

  it('does not write storage when the file is invalid', () => {
    const current = library([playlist('p1', 'Focus', [], 'Quiet tracks')])
    const storage = memoryStorage(serializeLibrary(current))
    const before = storage.values.get(MUSIC_LIBRARY_KEY)
    const stored = commitImport(storage, current, '{')
    expect(stored.ok).toBe(false)
    expect(storage.values.get(MUSIC_LIBRARY_KEY)).toBe(before)
    expect(loadLibrary(storage)).toEqual(current)
  })
})
