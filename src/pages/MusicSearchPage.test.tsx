import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { MusicProvider, PlaybackState } from '../music/MusicProvider.tsx'
import { saveRecents, type RecentItem } from '../music/search-history.ts'
import { saveLibrary, type LibraryStorage } from '../music/storage.ts'
import { isCurrentSearch, shouldSearch } from '../music/youtube-search.ts'
import pageSource from './MusicSearchPage.tsx?raw'
import musicPageSource from './MusicPage.tsx?raw'
import { MusicSearchPage } from './MusicSearchPage.tsx'

function memoryStorage(): LibraryStorage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
}

const song: RecentItem = {
  kind: 'song',
  id: 'dQw4w9WgXcQ',
  title: 'King of Kings',
  artist: 'Hillsong Worship',
  artworkUrl: 'https://i.ytimg.com/song.jpg',
}

const savedSong: RecentItem = {
  kind: 'song',
  id: 'abcdefghijk',
  title: 'Calm Lofi',
  artist: 'Bethel Music',
  artworkUrl: 'https://i.ytimg.com/saved.jpg',
}

const artist: RecentItem = {
  kind: 'artist',
  id: 'UC1234567890123456789012',
  title: 'Lauren Daigle',
  artist: '',
  artworkUrl: 'https://yt3.ggpht.com/artist.jpg',
}

const playlist: RecentItem = {
  kind: 'playlist',
  id: 'PLabc123',
  title: 'Sunday Playlist',
  artist: '',
  artworkUrl: 'https://i.ytimg.com/playlist.jpg',
}

function renderSearch(storage: LibraryStorage) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <MusicProvider storage={storage}>
        <PlaybackState />
        <MusicSearchPage recentsStorage={storage} />
      </MusicProvider>
    </MemoryRouter>,
  )
}

describe('music search page', () => {
  it('shows a disabled field and an under-construction notice', () => {
    const storage = memoryStorage()
    saveLibrary(storage, {
      playlists: [
        {
          id: 'p1',
          name: 'Focus',
          description: '',
          createdAt: '2026-11-05T00:00:00.000Z',
          updatedAt: '2026-11-05T00:00:00.000Z',
          tracks: [
            {
              id: 't1',
              youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
              videoId: 'abcdefghijk',
              title: 'Calm Lofi',
              addedAt: '2026-11-05T00:00:00.000Z',
            },
          ],
        },
      ],
    })
    saveRecents(storage, [song, savedSong, artist, playlist])
    const html = renderSearch(storage)
    const section = html.slice(html.indexOf('<section'), html.indexOf('</section>') + '</section>'.length)
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
    const searchCss = css.slice(css.indexOf('.search-screen'))
    const square = searchCss.slice(searchCss.indexOf('.search-art {'), searchCss.indexOf('.search-art.is-round'))

    expect(section).toContain('disabled=""')
    expect(section).toContain('search-construction-icon')
    expect(section).toContain('This page is under construction')
    expect(section).not.toContain('King of Kings')
    expect(section).not.toContain('Lauren Daigle')
    expect(section).not.toContain('Sunday Playlist')
    expect(section).not.toContain('<a')
    expect(section).not.toContain('youtube.com/watch')
    expect(html).toContain('data-playback="idle"')
    expect(square).toContain('border-radius: 0.25rem')
    expect(square).not.toContain('50%')
    expect(searchCss).toContain('border-radius: 50%')
    expect(searchCss).toContain('var(--text)')
    expect(searchCss).toContain('var(--page)')
    expect(searchCss).toContain('var(--accent-text)')
    expect(searchCss.toLowerCase()).not.toContain('spotify')
    expect(searchCss.toLowerCase()).not.toContain('#1db954')
  })

  it('guards empty queries, stale responses, and keeps library search local', () => {
    expect(shouldSearch('   ')).toBe(false)
    expect(shouldSearch('kings')).toBe(true)
    expect(isCurrentSearch('kings', ' kings ')).toBe(true)
    expect(isCurrentSearch('kings', 'other')).toBe(false)
    expect(pageSource).toContain('shouldSearch')
    expect(pageSource).toContain('isCurrentSearch')
    expect(pageSource).toContain('300')
    expect(pageSource).toContain('Nothing matched.')
    expect(pageSource).toContain('role="alert"')
    expect(pageSource).toContain('saveSearchedSong')
    expect(pageSource).toContain('markAdded')
    expect(pageSource).toContain('removeRecent')
    expect(pageSource).toContain('fetchYouTubeSearch')
    expect(pageSource).toContain('VITE_YOUTUBE_API_KEY')
    expect(pageSource).not.toContain('playTrack')
    expect(pageSource).not.toContain('youtube-dl')
    expect(pageSource).not.toContain('yt-dlp')
    expect(pageSource).not.toContain('Invidious')
    expect(pageSource).not.toContain('Piped')
    expect(musicPageSource).toContain('Search music')
    expect(musicPageSource).not.toContain('youtube-search')
  })
})
