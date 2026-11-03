import { describe, expect, it } from 'vitest'
import { parseYouTubeVideoUrl } from './youtube-link.ts'

const videoId = 'dQw4w9WgXcQ'

describe('parseYouTubeVideoUrl', () => {
  it.each([
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtube.com/watch?v=${videoId}`,
    `https://youtu.be/${videoId}`,
    `https://music.youtube.com/watch?v=${videoId}`,
    `https://www.youtube.com/shorts/${videoId}`,
    `https://youtube.com/shorts/${videoId}`,
    `https://www.youtube.com/embed/${videoId}`,
    `https://youtube.com/embed/${videoId}`,
  ])('accepts %s', (input) => {
    expect(parseYouTubeVideoUrl(input)).toEqual({ ok: true, videoId })
  })

  it('ignores extra watch parameters', () => {
    expect(
      parseYouTubeVideoUrl(
        `https://www.youtube.com/watch?v=${videoId}&t=43&list=PL123`,
      ),
    ).toEqual({ ok: true, videoId })
  })

  it.each([
    '',
    '   ',
    'https://www.youtube.com/playlist?list=PL1234567890',
    'https://www.youtube.com/channel/UC1234567890123456789012',
    'https://www.youtube.com/@artist',
    'https://www.youtube.com/results?search_query=music',
    'https://www.youtube.com/watch?list=PL123',
    'https://vimeo.com/123456789',
    'not a url',
  ])('rejects %s', (input) => {
    const result = parseYouTubeVideoUrl(input)
    expect(result.ok).toBe(false)
  })
})
