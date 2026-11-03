import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MusicProvider, PlaybackState } from '../music/MusicProvider.tsx'
import { saveLibrary, type LibraryStorage } from '../music/storage.ts'
import pageSource from './MusicPage.tsx?raw'
import playerSource from '../music/PlayerBar.tsx?raw'
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

describe('Music page', () => {
  it('shows an empty library and does not start playback', () => {
    const html = renderToStaticMarkup(
      <MusicProvider storage={memoryStorage()}>
        <PlaybackState />
        <MusicPage />
      </MusicProvider>,
    )

    expect(html).toContain('No playlists yet.')
    expect(html).toContain('New playlist')
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
    const html = renderToStaticMarkup(
      <MusicProvider storage={storage}>
        <PlaybackState />
        <MusicPage />
      </MusicProvider>,
    )

    expect(html).toContain('Focus')
    expect(html).toContain('Quiet tracks')
    expect(html).toContain('data-playback="idle"')
    expect(html).toContain('disabled=""')
  })

  it('keeps the official player in the shell and adds no ad slot', () => {
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
    const index = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
    expect(shellSource).toContain('PlayerBar')
    expect(shellSource).toContain('data-player')
    expect(playerSource).toContain('loadYouTubeIframeApi')
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
    expect(`${pageSource}${playerSource}`.toLowerCase()).not.toMatch(/skip ad|sponsor slot|googlesyndication/)
  })
})
