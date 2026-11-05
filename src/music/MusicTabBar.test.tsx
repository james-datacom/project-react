import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { MusicProvider } from './MusicProvider.tsx'
import { MusicTabBar } from './MusicTabBar.tsx'
import { musicPath, musicSearchPath } from './paths.ts'
import { MusicSearchPage } from '../pages/MusicSearchPage.tsx'
import { Header } from '../shell/Header.tsx'
import { ThemeProvider } from '../theme/ThemeProvider.tsx'
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

function renderBar(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <MusicProvider storage={memoryStorage()}>
        <Routes>
          <Route path={musicPath} element={<MusicTabBar />} />
          <Route path={musicSearchPath} element={<MusicSearchPage />} />
          <Route path={`${musicPath}/:playlistId`} element={<MusicTabBar />} />
        </Routes>
      </MusicProvider>
    </MemoryRouter>,
  )
}

describe('music tab bar', () => {
  it('places Home, Search, and Create at the bottom of the music page', () => {
    const html = renderBar(musicPath)
    const home = html.indexOf('>Home<')
    const search = html.indexOf('>Search<')
    const create = html.indexOf('>Create<')

    expect(html).toContain('aria-label="Music"')
    expect(html).toContain('class="music-tab-bar"')
    expect(home).toBeGreaterThan(-1)
    expect(home).toBeLessThan(search)
    expect(search).toBeLessThan(create)
    expect(html).toContain(`href="${musicPath}"`)
    expect(html).toContain(`href="${musicSearchPath}"`)
    expect(html).toContain('aria-current="page"')
    expect(html.indexOf('aria-current="page"')).toBeLessThan(html.indexOf('>Search<'))
  })

  it('shows the search field and marks Search current', () => {
    const storage = memoryStorage()
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={[musicSearchPath]}>
        <ThemeProvider>
          <MusicProvider storage={storage}>
            <Header menuOpen={false} showMenuButton={false} onMenuToggle={() => undefined} />
            <MusicSearchPage recentsStorage={storage} />
            <MusicTabBar />
          </MusicProvider>
        </ThemeProvider>
      </MemoryRouter>,
    )

    expect(html).toContain('aria-label="Search"')
    expect(html).toContain('placeholder="What do you want to listen to?"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('>Cancel<')
    expect(html).toContain('This page is under construction')
    expect(html).toContain('<h1 class="page-title">Search</h1>')
    expect(html).not.toContain('No playlists yet.')
    expect(html).not.toContain('New playlist')
    const search = html.indexOf(`href="${musicSearchPath}"`)
    const searchLink = html.slice(html.lastIndexOf('<a', search), html.indexOf('>', search))
    expect(searchLink).toContain('aria-current="page"')
  })

  it('keeps Home current on a playlist and stacks now playing above the menu', () => {
    const html = renderBar(`${musicPath}/p1`)
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

    expect(html.indexOf('aria-current="page"')).toBeLessThan(html.indexOf('>Search<'))
    expect(css).toContain('.music-tab-bar')
    expect(css).toContain('.mini-player.is-raised')
    expect(css).toContain('bottom: calc(var(--music-tab-height) + env(safe-area-inset-bottom))')
    const dialog = css.slice(css.indexOf('.music-dialog {'), css.indexOf('.music-dialog::backdrop'))
    const backdrop = css.slice(css.indexOf('.music-dialog::backdrop'))
    expect(dialog).toContain('position: fixed')
    expect(dialog).toContain('inset: 0')
    expect(dialog).toContain('margin: auto')
    expect(backdrop).toContain('backdrop-filter: blur(12px)')
  })
})
