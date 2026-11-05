import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  loadRecents,
  markAdded,
  mergeRecents,
  MUSIC_SEARCH_RECENTS_KEY,
  removeRecent,
  saveRecents,
  type RecentItem,
} from './search-history.ts'
import type { LibraryStorage } from './storage.ts'

function memoryStorage(): LibraryStorage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
}

function song(id: string): RecentItem {
  return {
    kind: 'song',
    id,
    title: `Song ${id}`,
    artist: 'Artist',
    artworkUrl: 'https://i.ytimg.com/song.jpg',
  }
}

describe('search history', () => {
  it('loads a missing value as an empty list', () => {
    expect(loadRecents(memoryStorage())).toEqual([])
  })

  it('loads invalid JSON as an empty list', () => {
    const storage = memoryStorage()
    storage.setItem(MUSIC_SEARCH_RECENTS_KEY, '{')
    expect(loadRecents(storage)).toEqual([])
  })

  it('moves a repeated song to the front once', () => {
    const merged = mergeRecents([song('a'), song('b'), song('c')], [song('b')])
    expect(merged.map((item) => item.id)).toEqual(['b', 'a', 'c'])
  })

  it('drops the oldest item past 50', () => {
    const current = Array.from({ length: 50 }, (_, index) => song(String(index).padStart(2, '0')))
    const merged = mergeRecents(current, [song('new')])
    expect(merged).toHaveLength(50)
    expect(merged[0].id).toBe('new')
    expect(merged.some((item) => item.id === '49')).toBe(false)
  })

  it('removes one item and leaves the others', () => {
    const next = removeRecent([song('a'), song('b')], 'song', 'a')
    expect(next.map((item) => item.id)).toEqual(['b'])
  })

  it('marks an artist added and leaves songs untouched', () => {
    const artist: RecentItem = {
      kind: 'artist',
      id: 'artist-1',
      title: 'Lauren Daigle',
      artist: '',
      artworkUrl: 'https://yt3.ggpht.com/artist.jpg',
    }
    const current = [song('a'), artist]
    const next = markAdded(current, 'artist', 'artist-1')
    expect(next[0]).toEqual(song('a'))
    expect(next[1]).toMatchObject({ kind: 'artist', added: true })
    expect(saveRecents.toString()).not.toContain('music-library')
    const source = readFileSync(new URL('./search-history.ts', import.meta.url), 'utf8')
    expect(source).not.toContain('music-library')
  })
})
