import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  addTrack,
  createPlaylist,
  deletePlaylist,
  emptyLibrary,
  removeTrack,
  saveSearchedSong,
  updatePlaylist,
  type Library,
} from './library.ts'
import { loadLibrary, MUSIC_LIBRARY_KEY, saveLibrary, type LibraryStorage } from './storage.ts'

const now = '2026-11-03T00:00:00.000Z'
const later = '2026-11-03T01:00:00.000Z'

function libraryWith(name: string, id: string): Library {
  const result = createPlaylist(emptyLibrary, { name }, { id, now })
  if (!result.ok) throw new Error(result.error)
  return result.library
}

describe('playlist library', () => {
  it('trims a name and stores an empty description', () => {
    const result = createPlaylist(emptyLibrary, { name: '  Focus  ' }, { id: 'p1', now })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.library.playlists[0]).toMatchObject({
      id: 'p1',
      name: 'Focus',
      description: '',
      createdAt: now,
      updatedAt: now,
      tracks: [],
    })
  })

  it('rejects a blank name and an over-long name', () => {
    expect(createPlaylist(emptyLibrary, { name: '   ' }, { id: 'p1', now }).ok).toBe(false)
    expect(createPlaylist(emptyLibrary, { name: 'a'.repeat(81) }, { id: 'p1', now }).ok).toBe(false)
    expect(createPlaylist(emptyLibrary, { name: 'a'.repeat(80) }, { id: 'p1', now }).ok).toBe(true)
  })

  it('allows two playlists to share a name with different ids', () => {
    const first = libraryWith('Focus', 'p1')
    const second = createPlaylist(first, { name: 'Focus' }, { id: 'p2', now })
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.library.playlists.map((playlist) => playlist.id)).toEqual(['p1', 'p2'])
    expect(second.library.playlists.map((playlist) => playlist.name)).toEqual(['Focus', 'Focus'])
  })

  it('edits only the selected playlist name and keeps its stored description', () => {
    const stored: Library = {
      playlists: [
        {
          id: 'p1',
          name: 'Focus',
          description: 'Quiet tracks',
          createdAt: now,
          updatedAt: now,
          tracks: [],
        },
        {
          id: 'p2',
          name: 'Other',
          description: 'Keep',
          createdAt: now,
          updatedAt: now,
          tracks: [],
        },
      ],
    }
    const updated = updatePlaylist(stored, 'p1', { name: '  Renamed  ' }, later)
    expect(updated.ok).toBe(true)
    if (!updated.ok) return
    expect(updated.library.playlists[0]).toMatchObject({
      name: 'Renamed',
      description: 'Quiet tracks',
      updatedAt: later,
    })
    expect(updated.library.playlists[1]).toEqual(stored.playlists[1])
  })

  it('deletes one playlist and leaves the other', () => {
    const first = libraryWith('Focus', 'p1')
    const both = createPlaylist(first, { name: 'Other' }, { id: 'p2', now })
    if (!both.ok) throw new Error(both.error)
    const deleted = deletePlaylist(both.library, 'p1')
    expect(deleted.ok).toBe(true)
    if (!deleted.ok) return
    expect(deleted.library.playlists.map((playlist) => playlist.id)).toEqual(['p2'])
  })

  it('rejects a duplicate video in one playlist and allows it in another', () => {
    const created = libraryWith('Focus', 'p1')
    const other = createPlaylist(created, { name: 'Other' }, { id: 'p2', now })
    if (!other.ok) throw new Error(other.error)
    const track = {
      id: 't1',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoId: 'dQw4w9WgXcQ',
      title: 'Example title',
      addedAt: now,
    }
    const added = addTrack(other.library, 'p1', track, later)
    expect(added.ok).toBe(true)
    if (!added.ok) return
    const duplicate = addTrack(added.library, 'p1', { ...track, id: 't2' }, later)
    expect(duplicate).toMatchObject({ ok: false, error: 'That video is already in this playlist.' })
    expect(added.library.playlists[0].tracks).toHaveLength(1)
    const elsewhere = addTrack(added.library, 'p2', { ...track, id: 't3' }, later)
    expect(elsewhere.ok).toBe(true)
  })

  it('removes one track and leaves the rest', () => {
    const created = libraryWith('Focus', 'p1')
    const first = addTrack(
      created,
      'p1',
      {
        id: 't1',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoId: 'dQw4w9WgXcQ',
        title: 'One',
        addedAt: now,
      },
      later,
    )
    if (!first.ok) throw new Error(first.error)
    const second = addTrack(
      first.library,
      'p1',
      {
        id: 't2',
        youtubeUrl: 'https://youtu.be/abcdefghijk',
        videoId: 'abcdefghijk',
        title: 'Two',
        addedAt: now,
      },
      later,
    )
    if (!second.ok) throw new Error(second.error)
    const removed = removeTrack(second.library, 'p1', 't1', later)
    expect(removed.ok).toBe(true)
    if (!removed.ok) return
    expect(removed.library.playlists[0].tracks.map((track) => track.id)).toEqual(['t2'])
  })

  it('saves a searched song once on Saved songs and reloads it', () => {
    let savedRaw: string | null = null
    const storage: LibraryStorage = {
      getItem: (key) => (key === MUSIC_LIBRARY_KEY ? savedRaw : null),
      setItem: (key, value) => {
        if (key === MUSIC_LIBRARY_KEY) savedRaw = value
      },
    }
    const song = {
      videoId: 'dQw4w9WgXcQ',
      title: 'King of Kings',
      trackId: 'track-1',
      now,
    }
    const first = saveSearchedSong(emptyLibrary, song)
    expect(first.playlists).toHaveLength(1)
    expect(first.playlists[0]).toMatchObject({
      id: 'search-saved',
      name: 'Saved songs',
      description: '',
      createdAt: now,
      updatedAt: now,
    })
    expect(first.playlists[0].tracks[0]).toEqual({
      id: 'track-1',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoId: 'dQw4w9WgXcQ',
      title: 'King of Kings',
      addedAt: now,
    })
    const again = saveSearchedSong(first, { ...song, trackId: 'track-2' })
    expect(again).toBe(first)
    expect(again.playlists[0].tracks).toHaveLength(1)

    const elsewhere: Library = {
      playlists: [
        {
          id: 'p1',
          name: 'Focus',
          description: '',
          createdAt: now,
          updatedAt: now,
          tracks: [
            {
              id: 't1',
              youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
              videoId: 'abcdefghijk',
              title: 'Already here',
              addedAt: now,
            },
          ],
        },
      ],
    }
    const copied = saveSearchedSong(elsewhere, {
      videoId: 'abcdefghijk',
      title: 'Already here',
      trackId: 'track-3',
      now: later,
    })
    expect(copied).toBe(elsewhere)
    expect(copied.playlists[0].tracks).toEqual(elsewhere.playlists[0].tracks)

    saveLibrary(storage, first)
    expect(loadLibrary(storage).playlists[0].tracks[0]).toMatchObject({
      title: 'King of Kings',
      videoId: 'dQw4w9WgXcQ',
    })

    const providerSource = readFileSync(new URL('./MusicProvider.tsx', import.meta.url), 'utf8')
    const start = providerSource.indexOf('saveSearchedSong: (videoId, title)')
    const body = providerSource.slice(start, providerSource.indexOf('removeTrack:', start))
    expect(body).toContain('commit(')
    expect(body).not.toContain('playPlaylist')
    expect(body).not.toContain('playTrack')
    expect(body).not.toContain('issue')
  })
})
