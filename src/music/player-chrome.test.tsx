import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { saveLibrary, type LibraryStorage } from './storage.ts'
import { MiniPlayer } from './MiniPlayer.tsx'
import { MusicProvider, type Session } from './MusicProvider.tsx'
import { NowPlaying } from './NowPlaying.tsx'

function memoryStorage(): LibraryStorage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
}

const session: Session = {
  playlistId: 'p1',
  trackIds: ['a', 'b', 'c'],
  index: 0,
  failedIds: [],
  paused: false,
}

function libraryStorage() {
  const storage = memoryStorage()
  saveLibrary(storage, {
    playlists: [
      {
        id: 'p1',
        name: 'Focus',
        description: 'Quiet tracks',
        createdAt: '2026-11-03T00:00:00.000Z',
        updatedAt: '2026-11-03T00:00:00.000Z',
        tracks: [
          {
            id: 'a',
            title: 'First',
            youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
            videoId: 'abcdefghijk',
            addedAt: '2026-11-03T00:00:00.000Z',
          },
          {
            id: 'b',
            title: 'Second',
            youtubeUrl: 'https://www.youtube.com/watch?v=bcdefghijkl',
            videoId: 'bcdefghijkl',
            addedAt: '2026-11-03T00:00:00.000Z',
          },
          {
            id: 'c',
            title: 'Third',
            youtubeUrl: 'https://www.youtube.com/watch?v=cdefghijklm',
            videoId: 'cdefghijklm',
            addedAt: '2026-11-03T00:00:00.000Z',
          },
        ],
      },
    ],
  })
  return storage
}

describe('player chrome', () => {
  it('hides the mini player when nothing is queued', () => {
    const html = renderToStaticMarkup(
      <MusicProvider storage={memoryStorage()}>
        <MiniPlayer wideMusic={false} />
      </MusicProvider>,
    )
    expect(html).not.toContain('mini-player')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('player-frame')
  })

  it('keeps play and pause separate from opening now playing', () => {
    const playing = renderToStaticMarkup(
      <MusicProvider storage={libraryStorage()} initialSession={session}>
        <MiniPlayer wideMusic={false} />
        <NowPlaying presentation="sheet" />
      </MusicProvider>,
    )
    expect(playing).toContain('Open now playing')
    expect(playing).toContain('aria-label="Pause"')
    expect(playing).toContain('aria-label="Shuffle off"')
    expect(playing).toContain('aria-label="Previous"')
    expect(playing).toContain('aria-label="Next"')
    const surface = playing.slice(playing.indexOf('aria-label="Now playing"'))
    expect(playing).toContain('aria-label="Repeat off"')
    expect(surface.indexOf('aria-label="Shuffle off"')).toBeLessThan(surface.indexOf('aria-label="Previous"'))
    expect(surface.indexOf('aria-label="Previous"')).toBeLessThan(surface.indexOf('aria-label="Pause"'))
    expect(surface.indexOf('aria-label="Pause"')).toBeLessThan(surface.indexOf('aria-label="Next"'))
    expect(surface.indexOf('aria-label="Next"')).toBeLessThan(surface.indexOf('aria-label="Repeat off"'))
    expect(playing).toContain('https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg')
    expect(playing).not.toContain('img.youtube.com')
    expect(playing).not.toContain('<iframe')
    expect(playing).not.toContain('player-frame')

    const paused = renderToStaticMarkup(
      <MusicProvider storage={libraryStorage()} initialSession={{ ...session, paused: true }}>
        <MiniPlayer wideMusic={false} />
      </MusicProvider>,
    )
    expect(paused).toContain('aria-label="Play"')
    expect(paused).not.toContain('aria-label="Pause"')
  })

  it('shows the next song as a ticker and does not open a queue page', () => {
    const html = renderToStaticMarkup(
      <MusicProvider storage={libraryStorage()} initialSession={session} initialQueueOpen>
        <NowPlaying presentation="sheet" />
      </MusicProvider>,
    )
    expect(html).toContain('Up Next: Second')
    expect(html).toContain('up-next-track')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('aria-expanded')
    expect(html).not.toContain('up-next-sheet')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('player-frame')

    const last = renderToStaticMarkup(
      <MusicProvider storage={libraryStorage()} initialSession={{ ...session, index: 2 }}>
        <NowPlaying presentation="sheet" />
      </MusicProvider>,
    )
    expect(last).not.toContain('Up Next:')
    expect(last).toContain('aria-label="Next" disabled=""')
  })

  it('does not reserve a player frame in the stylesheet', () => {
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
    const provider = readFileSync(new URL('./MusicProvider.tsx', import.meta.url), 'utf8')
    expect(css).not.toContain('.player-frame')
    expect(css).not.toContain('grid-row: 3')
    expect(css).toContain('env(safe-area-inset-bottom)')
    expect(css).toContain('max-height: 100dvh')
    expect(css).toContain('overflow: auto')
    expect(css).not.toMatch(/icon-rail|64px/)
    expect(css.toLowerCase()).not.toContain('spotify')
    const closeNow = provider.slice(provider.indexOf('closeNowPlaying:'), provider.indexOf('openQueue:'))
    const closeQueue = provider.slice(provider.indexOf('closeQueue:'), provider.indexOf('togglePlay:'))
    expect(closeNow).not.toContain('pause')
    expect(closeNow).not.toContain('togglePlay')
    expect(closeQueue).not.toContain('pause')
    expect(closeQueue).not.toContain('togglePlay')
    expect(provider).toContain('setNowPlayingOpen(false)')
    expect(provider).toContain('setQueueOpen(false)')
    expect(provider).toContain('playAtIndex')
    const playAt = provider.slice(provider.lastIndexOf('playAt: (index) =>'), provider.lastIndexOf('openNowPlaying:'))
    expect(playAt).toContain('playAtIndex')
    expect(playAt).not.toContain('startAtTrack')
  })
})
