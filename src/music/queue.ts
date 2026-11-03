export type RepeatMode = 'off' | 'all' | 'one'

export type QueueState = {
  trackIds: string[]
  index: number
  failedIds: string[]
}

export type QueueResult =
  | { type: 'play'; queue: QueueState }
  | { type: 'restart' }
  | { type: 'replay' }
  | { type: 'stop' }

export type ShuffleOptions = {
  shuffle?: boolean
  random?: () => number
}

function shuffled(ids: string[], random: () => number) {
  const next = [...ids]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = current
  }
  return next
}

export function startPlaylist(trackIds: string[], options: ShuffleOptions = {}): QueueState | null {
  if (trackIds.length === 0) return null
  const ids = options.shuffle ? shuffled(trackIds, options.random ?? Math.random) : [...trackIds]
  return { trackIds: ids, index: 0, failedIds: [] }
}

export function startAtTrack(
  trackIds: string[],
  trackId: string,
  options: ShuffleOptions = {},
): QueueState | null {
  const start = trackIds.indexOf(trackId)
  if (start < 0) return null
  if (!options.shuffle) return { trackIds: [...trackIds], index: start, failedIds: [] }
  const rest = shuffled(
    trackIds.filter((id) => id !== trackId),
    options.random ?? Math.random,
  )
  return { trackIds: [trackId, ...rest], index: 0, failedIds: [] }
}

export function nextTrack(queue: QueueState, repeat: RepeatMode, options: ShuffleOptions = {}): QueueResult {
  if (queue.index < queue.trackIds.length - 1) {
    return { type: 'play', queue: { ...queue, index: queue.index + 1 } }
  }
  if (repeat === 'off') return { type: 'stop' }
  if (options.shuffle && repeat === 'all') {
    return {
      type: 'play',
      queue: {
        trackIds: shuffled(queue.trackIds, options.random ?? Math.random),
        index: 0,
        failedIds: [],
      },
    }
  }
  return { type: 'play', queue: { ...queue, index: 0, failedIds: [] } }
}

export function previousTrack(queue: QueueState): QueueResult {
  if (queue.index === 0) return { type: 'restart' }
  return { type: 'play', queue: { ...queue, index: queue.index - 1 } }
}

export function endOfTrack(queue: QueueState, repeat: RepeatMode, options: ShuffleOptions = {}): QueueResult {
  if (repeat === 'one') return { type: 'replay' }
  return nextTrack(queue, repeat, options)
}

export function skipUnavailable(
  queue: QueueState,
  repeat: RepeatMode,
  options: ShuffleOptions = {},
): QueueResult {
  const current = queue.trackIds[queue.index]
  const failedIds = queue.failedIds.includes(current) ? queue.failedIds : [...queue.failedIds, current]
  if (queue.trackIds.every((id) => failedIds.includes(id))) return { type: 'stop' }
  const advanced = nextTrack({ ...queue, failedIds }, repeat, options)
  if (advanced.type !== 'play') return { type: 'stop' }
  if (failedIds.includes(advanced.queue.trackIds[advanced.queue.index])) {
    return skipUnavailable(advanced.queue, repeat, options)
  }
  return { type: 'play', queue: { ...advanced.queue, failedIds } }
}

export function playAtIndex(queue: QueueState, index: number): QueueState | null {
  if (index < 0 || index >= queue.trackIds.length) return null
  return { trackIds: [...queue.trackIds], index, failedIds: queue.failedIds }
}

export function orderForShuffle(
  queue: QueueState,
  enabled: boolean,
  savedIds: string[],
  random: () => number = Math.random,
): QueueState {
  const currentId = queue.trackIds[queue.index]
  if (!enabled) {
    const trackIds = savedIds.filter((id) => queue.trackIds.includes(id))
    const index = Math.max(0, trackIds.indexOf(currentId))
    return { trackIds, index, failedIds: queue.failedIds }
  }
  const rest = shuffled(
    queue.trackIds.filter((id) => id !== currentId),
    random,
  )
  return { trackIds: [currentId, ...rest], index: 0, failedIds: queue.failedIds }
}

export function cycleRepeat(mode: RepeatMode): RepeatMode {
  if (mode === 'off') return 'all'
  if (mode === 'all') return 'one'
  return 'off'
}
