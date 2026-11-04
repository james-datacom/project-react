import { describe, expect, it, vi } from 'vitest'
import { linkToFetch, titleForSave, titleFromLookup } from './song-title.ts'

const watch = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

describe('song title from a pasted link', () => {
  it('fills the title from an accepted link', () => {
    expect(linkToFetch(`  ${watch}  `)).toBe(watch)
    expect(titleFromLookup(1, 1, 'Example title')).toEqual({ apply: true, title: 'Example title' })
  })

  it('saves the edited title', () => {
    const saved = titleForSave('  Edited title  ')
    const add = vi.fn()
    if (saved) add(saved)
    expect(add).toHaveBeenCalledWith('Edited title')
  })

  it('leaves the title empty when lookup fails until a title is typed', () => {
    expect(titleFromLookup(1, 1, null)).toEqual({ apply: true, title: '' })
    expect(titleForSave('')).toBeNull()
    expect(titleForSave('Typed title')).toBe('Typed title')
  })

  it('does not add a song when the title is cleared', () => {
    const add = vi.fn()
    const saved = titleForSave('   ')
    if (saved) add(saved)
    expect(add).not.toHaveBeenCalled()
  })

  it('ignores a lookup for a link that is no longer in the field', () => {
    expect(linkToFetch('not a link')).toBeNull()
    expect(titleFromLookup(2, 1, 'Stale title')).toEqual({ apply: false })
  })
})
