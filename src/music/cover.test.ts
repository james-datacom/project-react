import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { coverFromTitle, thumbnailUrl } from './cover.ts'

describe('coverFromTitle', () => {
  it('uses the first character of the first two words', () => {
    expect(coverFromTitle('Blue Monday').initials).toBe('BM')
  })

  it('uses the first two characters of a single word', () => {
    expect(coverFromTitle('Blue').initials).toBe('BL')
  })

  it('returns the same color for the same title', () => {
    expect(coverFromTitle('Blue Monday').color).toBe(coverFromTitle('Blue Monday').color)
  })

  it('builds a YouTube thumbnail from the video id', () => {
    expect(thumbnailUrl('abcdefghijk')).toBe('https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg')
    expect(thumbnailUrl('')).toBe('')
  })

  it('does not use Spotify green', () => {
    const source = readFileSync(new URL('./cover.ts', import.meta.url), 'utf8')
    expect(source.toLowerCase()).not.toContain('#1db954')
    expect(coverFromTitle('Blue Monday').color.toLowerCase()).not.toBe('#1db954')
  })
})
