import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Track } from './library.ts'
import { PlaylistCover } from './PlaylistCover.tsx'

function track(videoId: string): Track {
  return {
    id: videoId,
    title: videoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
    addedAt: '2026-11-03T00:00:00.000Z',
  }
}

describe('PlaylistCover', () => {
  it('keeps the initials avatar when the playlist has no songs', () => {
    const html = renderToStaticMarkup(<PlaylistCover name="Focus" tracks={[]} />)

    expect(html).toContain('music-playlist-avatar')
    expect(html).toContain('FO')
    expect(html).not.toContain('playlist-avatar-group')
    expect(html).not.toContain('i.ytimg.com')
  })

  it('groups the first four songs in playlist order', () => {
    const tracks = ['aaaaa111111', 'bbbbb222222', 'ccccc333333', 'ddddd444444', 'eeeee555555'].map(track)
    const html = renderToStaticMarkup(<PlaylistCover name="Focus" tracks={tracks} />)

    expect(html).toContain('data-count="4"')
    expect(html.indexOf('aaaaa111111')).toBeLessThan(html.indexOf('bbbbb222222'))
    expect(html.indexOf('bbbbb222222')).toBeLessThan(html.indexOf('ccccc333333'))
    expect(html.indexOf('ccccc333333')).toBeLessThan(html.indexOf('ddddd444444'))
    expect(html).not.toContain('eeeee555555')
    expect(html).not.toContain('music-playlist-avatar')
  })

  it('uses one cell for a single song and two columns for two songs', () => {
    const one = renderToStaticMarkup(<PlaylistCover name="Focus" tracks={[track('aaaaa111111')]} />)
    const two = renderToStaticMarkup(
      <PlaylistCover name="Focus" tracks={[track('aaaaa111111'), track('bbbbb222222')]} />,
    )

    expect(one).toContain('data-count="1"')
    expect(two).toContain('data-count="2"')
  })
})
