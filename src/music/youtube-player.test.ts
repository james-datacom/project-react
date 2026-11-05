import { describe, expect, it } from 'vitest'
import { initialPlaybackVideo, playFromCue, playbackStarted, trackEnded } from './youtube-player.ts'

const load = { action: 'load', videoId: 'abcdefghijk' }

describe('first playback', () => {
  it('starts the video that was requested before the player existed', () => {
    expect(initialPlaybackVideo(load, false)).toBe('abcdefghijk')
  })

  it('does not start a video while playback is paused', () => {
    expect(initialPlaybackVideo(load, true)).toBe('')
    expect(initialPlaybackVideo({ action: 'pause', videoId: '' }, false)).toBe('')
    expect(initialPlaybackVideo(null, false)).toBe('')
  })

  it('does not treat the player opening as the end of the song', () => {
    expect(trackEnded(0, false)).toBe(false)
    expect(playbackStarted(0, false)).toBe(false)
  })

  it('ends the song only after it has played', () => {
    expect(playbackStarted(1, false)).toBe(true)
    expect(trackEnded(0, true)).toBe(true)
  })

  it('plays a cued video when playback was requested', () => {
    expect(playFromCue(5, true)).toBe(true)
    expect(playFromCue(5, false)).toBe(false)
    expect(playFromCue(1, true)).toBe(false)
  })
})
