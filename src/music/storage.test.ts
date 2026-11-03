import { describe, expect, it } from 'vitest'
import { emptyLibrary, type Library } from './library.ts'
import { loadLibrary, MUSIC_LIBRARY_KEY, saveLibrary, type LibraryStorage } from './storage.ts'

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

const library: Library = {
  playlists: [
    {
      id: 'p1',
      name: 'Focus',
      description: 'Quiet tracks',
      createdAt: '2026-11-03T00:00:00.000Z',
      updatedAt: '2026-11-03T00:00:00.000Z',
      tracks: [
        {
          id: 't1',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoId: 'dQw4w9WgXcQ',
          title: 'Example title',
          addedAt: '2026-11-03T00:00:00.000Z',
        },
      ],
    },
  ],
}

describe('music library storage', () => {
  it('round-trips the stored shape under music-library', () => {
    const storage = memoryStorage()
    saveLibrary(storage, library)
    expect(storage.values.has(MUSIC_LIBRARY_KEY)).toBe(true)
    expect(loadLibrary(storage)).toEqual(library)
  })

  it('starts empty when the key is missing, the JSON is invalid, or the value is malformed', () => {
    expect(loadLibrary(memoryStorage())).toEqual(emptyLibrary)
    expect(loadLibrary(memoryStorage('not json'))).toEqual(emptyLibrary)
    expect(loadLibrary(memoryStorage(JSON.stringify({ playlists: [{ id: 'p1' }] })))).toEqual(emptyLibrary)
    expect(loadLibrary(memoryStorage(JSON.stringify({ playlists: 'nope' })))).toEqual(emptyLibrary)
  })
})
