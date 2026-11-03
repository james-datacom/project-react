import { describe, expect, it } from 'vitest'
import {
  cycleRepeat,
  endOfTrack,
  nextTrack,
  orderForShuffle,
  playAtIndex,
  previousTrack,
  skipUnavailable,
  startAtTrack,
  startPlaylist,
  type QueueState,
} from './queue.ts'

const tracks = ['a', 'b', 'c']
const reverse = () => 0

function atEnd(queue: QueueState) {
  let current = queue
  while (current.index < current.trackIds.length - 1) {
    const step = nextTrack(current, 'off')
    if (step.type !== 'play') break
    current = step.queue
  }
  return current
}

describe('playback queue', () => {
  it('starts at the first song and continues in saved order', () => {
    const queue = startPlaylist(tracks, { shuffle: false })
    expect(queue).toEqual({ trackIds: tracks, index: 0, failedIds: [] })
    const step = nextTrack(queue!, 'off')
    expect(step).toEqual({ type: 'play', queue: { trackIds: tracks, index: 1, failedIds: [] } })
  })

  it('starts at a chosen row and continues through the songs after it', () => {
    const queue = startAtTrack(tracks, 'b', { shuffle: false })
    expect(queue).toEqual({ trackIds: tracks, index: 1, failedIds: [] })
    const step = nextTrack(queue!, 'off')
    expect(step).toMatchObject({ type: 'play', queue: { index: 2, trackIds: tracks } })
  })

  it('restarts the first song on previous', () => {
    const queue = startPlaylist(tracks, { shuffle: false })!
    expect(previousTrack(queue)).toEqual({ type: 'restart' })
  })

  it('stops on the last song when repeat is off and wraps when repeat is all or one', () => {
    const queue = atEnd(startPlaylist(tracks, { shuffle: false })!)
    expect(nextTrack(queue, 'off')).toEqual({ type: 'stop' })
    expect(nextTrack(queue, 'all')).toMatchObject({ type: 'play', queue: { index: 0, trackIds: tracks } })
    expect(nextTrack(queue, 'one')).toMatchObject({ type: 'play', queue: { index: 0, trackIds: tracks } })
  })

  it('replays the current song when it ends and repeat is one', () => {
    const queue = startPlaylist(tracks, { shuffle: false })!
    expect(endOfTrack(queue, 'one')).toEqual({ type: 'replay' })
  })

  it('plays each shuffled song once before repeating any', () => {
    const queue = startPlaylist(tracks, { shuffle: true, random: reverse })
    expect(queue?.trackIds).toEqual(['b', 'c', 'a'])
    expect(queue?.index).toBe(0)
    expect(new Set(queue?.trackIds)).toEqual(new Set(tracks))
  })

  it('stops a finished shuffle cycle when repeat is off and reshuffles when repeat is all', () => {
    const queue = atEnd(startPlaylist(tracks, { shuffle: true, random: reverse })!)
    expect(nextTrack(queue, 'off', { shuffle: true, random: reverse })).toEqual({ type: 'stop' })
    const again = nextTrack(queue, 'all', { shuffle: true, random: reverse })
    expect(again.type).toBe('play')
    if (again.type !== 'play') return
    expect(again.queue.index).toBe(0)
    expect(again.queue.trackIds).toEqual(['c', 'a', 'b'])
    expect(new Set(again.queue.trackIds)).toEqual(new Set(tracks))
  })

  it('stops skipping when every song in the cycle has failed', () => {
    let queue = startPlaylist(tracks, { shuffle: false })!
    const first = skipUnavailable(queue, 'off')
    expect(first.type).toBe('play')
    if (first.type !== 'play') return
    const second = skipUnavailable(first.queue, 'off')
    expect(second.type).toBe('play')
    if (second.type !== 'play') return
    expect(skipUnavailable(second.queue, 'off')).toEqual({ type: 'stop' })
    queue = second.queue
    expect(queue.failedIds).toEqual(['a', 'b'])
  })

  it('plays a later index through the same list without reshuffling', () => {
    const queue = { trackIds: tracks, index: 0, failedIds: [] as string[] }
    expect(playAtIndex(queue, 1)).toEqual({ trackIds: tracks, index: 1, failedIds: [] })
    const shuffled = startPlaylist(tracks, { shuffle: true, random: reverse })!
    const played = playAtIndex(shuffled, 1)
    expect(played?.trackIds).toEqual(shuffled.trackIds)
    expect(played?.index).toBe(1)
    expect(startAtTrack(tracks, 'b', { shuffle: false })).toEqual({
      trackIds: tracks,
      index: 1,
      failedIds: [],
    })
  })

  it('shuffles the songs after the current one and restores saved order when shuffle is off', () => {
    const queue = { trackIds: tracks, index: 1, failedIds: [] as string[] }
    const enabled = orderForShuffle(queue, true, tracks, reverse)
    expect(enabled.trackIds[0]).toBe('b')
    expect(enabled.index).toBe(0)
    expect(new Set(enabled.trackIds)).toEqual(new Set(tracks))
    const restored = orderForShuffle(enabled, false, tracks, reverse)
    expect(restored.trackIds).toEqual(tracks)
    expect(restored.trackIds[restored.index]).toBe('b')
  })

  it('cycles repeat off, all, one, and back to off', () => {
    expect(cycleRepeat('off')).toBe('all')
    expect(cycleRepeat('all')).toBe('one')
    expect(cycleRepeat('one')).toBe('off')
  })
})
