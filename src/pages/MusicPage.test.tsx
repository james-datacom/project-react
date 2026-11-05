import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { MusicProvider, PlaybackState } from '../music/MusicProvider.tsx'
import { MUSIC_LIBRARY_KEY, saveLibrary, type LibraryStorage } from '../music/storage.ts'
import { playlistFile } from '../music/transfer.ts'
import pageSource from './MusicPage.tsx?raw'
import playerSource from '../music/AudioEngine.tsx?raw'
import youtubeSource from '../music/youtube-player.ts?raw'
import shellSource from '../shell/AppShell.tsx?raw'
import { MusicPage } from './MusicPage.tsx'

function memoryStorage(): LibraryStorage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
}

function renderMusic(path: string, storage: LibraryStorage = memoryStorage()) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <MusicProvider storage={storage}>
        <PlaybackState />
        <Routes>
          <Route path="/entertainment/music" element={<MusicPage />} />
          <Route path="/entertainment/music/:playlistId" element={<MusicPage />} />
        </Routes>
      </MusicProvider>
    </MemoryRouter>,
  )
}

describe('Music page', () => {
  it('shows an empty library and does not start playback', () => {
    const html = renderMusic('/entertainment/music')

    expect(html).toContain('No playlists yet.')
    expect(html).toContain('Search music')
    expect(html).toContain('Add playlist')
    expect(html).toContain('Playlist actions')
    expect(html).toContain('Export Playlist')
    expect(html).toContain('Import Playlist')
    expect(html).toContain('accept="application/json,.json"')
    expect(html).toContain('data-playback="idle"')
    expect(html.toLowerCase()).not.toContain('spotify')
    expect(pageSource.toLowerCase()).not.toContain('spotify')
  })

  it('shows a saved playlist after a fresh load without autoplay', () => {
    const storage = memoryStorage()
    saveLibrary(storage, {
      playlists: [
        {
          id: 'p1',
          name: 'Focus',
          description: 'Quiet tracks',
          createdAt: '2026-11-03T00:00:00.000Z',
          updatedAt: '2026-11-03T00:00:00.000Z',
          tracks: [],
        },
      ],
    })
    const html = renderMusic('/entertainment/music', storage)
    const songs = renderMusic('/entertainment/music/p1', storage)

    expect(html).toContain('Focus')
    expect(html).toContain('href="/entertainment/music/p1"')
    expect(html).toContain('music-playlist-avatar')
    expect(html).not.toContain('Quiet tracks')
    expect(html).not.toContain('Select a playlist')
    expect(html).toContain('data-playback="idle"')
    expect(songs).not.toContain('Quiet tracks')
    expect(pageSource).not.toContain('Description')
    expect(songs).not.toContain('Playlist actions')
    expect(songs).toContain('Add song')
    expect(songs).toContain('aria-label="Play"')
    expect(songs).toContain('disabled=""')
    expect(songs).toContain('This playlist has no songs.')
  })

  it('keeps the official player in the shell and adds no ad slot', () => {
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
    const index = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
    expect(shellSource).toContain('PlayerChrome')
    expect(shellSource).toContain('data-player')
    expect(playerSource).toContain('loadYouTubeIframeApi')
    expect(playerSource).toContain('Playback is unavailable.')
    expect(playerSource).toContain('role="alert"')
    expect(playerSource).not.toContain('.player-frame')
    expect(playerSource).not.toContain('Invidious')
    expect(playerSource).not.toContain('Piped')
    expect(youtubeSource).toContain('https://www.youtube.com/iframe_api')
    expect(youtubeSource).toContain('controls: 0')
    expect(youtubeSource).toContain('rel: 0')
    expect(youtubeSource).toContain('playsinline: 1')
    expect(youtubeSource).toContain('origin: window.location.origin')
    expect(playerSource).not.toContain('youtube-dl')
    expect(youtubeSource).not.toContain('yt-dlp')
    expect(pageSource).toContain('fetchYouTubeTitle')
    expect(pageSource).toContain('role="alert"')
    expect(css).toContain('.music-layout')
    expect(css).toContain('grid-template-columns: 1fr')
    expect(css).not.toMatch(/icon-rail|64px/)
    expect(index.toLowerCase()).not.toMatch(/googlesyndication|doubleclick|adsbygoogle|skip ad/)
    expect(`${pageSource}${playerSource}`.toLowerCase()).not.toMatch(/skip ad|skip-ad|sponsor slot|googlesyndication/)
  })

  it('prepares a playlist download without changing stored playlists', () => {
    const storage = memoryStorage()
    saveLibrary(storage, {
      playlists: [
        {
          id: 'p1',
          name: 'Focus',
          description: 'Quiet tracks',
          createdAt: '2026-11-03T00:00:00.000Z',
          updatedAt: '2026-11-03T00:00:00.000Z',
          tracks: [],
        },
      ],
    })
    const before = storage.getItem(MUSIC_LIBRARY_KEY)
    renderMusic('/entertainment/music', storage)
    const file = playlistFile({
      playlists: [
        {
          id: 'p1',
          name: 'Focus',
          description: 'Quiet tracks',
          createdAt: '2026-11-03T00:00:00.000Z',
          updatedAt: '2026-11-03T00:00:00.000Z',
          tracks: [],
        },
      ],
    })

    expect(file.filename).toBe('music-library.json')
    expect(JSON.parse(file.body).playlists[0].name).toBe('Focus')
    expect(pageSource).toContain('playlistFile')
    expect(pageSource).not.toContain('saveLibrary')
    expect(storage.getItem(MUSIC_LIBRARY_KEY)).toBe(before)
  })
})
