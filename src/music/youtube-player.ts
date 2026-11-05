export type PlayerHandle = {
  loadVideoById: (videoId: string) => void
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  setVolume: (volume: number) => void
  mute: () => void
  unMute: () => void
  getCurrentTime: () => number
  getDuration: () => number
}

const PLAYER_ENDED = 0
const PLAYER_PLAYING = 1
const PLAYER_CUED = 5

export function playbackStarted(state: number, started: boolean) {
  return started || state === PLAYER_PLAYING
}

export function trackEnded(state: number, started: boolean) {
  return state === PLAYER_ENDED && started
}

export function playFromCue(state: number, wantsPlay: boolean) {
  return wantsPlay && state === PLAYER_CUED
}

export function initialPlaybackVideo(
  command: { action: string; videoId: string } | null,
  paused: boolean,
) {
  if (!command || paused || !command.videoId) return ''
  if (command.action !== 'load' && command.action !== 'seek-start') return ''
  return command.videoId
}

type YouTubePlayer = PlayerHandle & {
  destroy: () => void
}

type YouTubeNamespace = {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer
}

type YouTubePlayerOptions = {
  width?: string
  height?: string
  videoId?: string
  playerVars?: {
    autoplay?: number
    controls: number
    rel: number
    playsinline: number
    origin: string
  }
  events?: {
    onReady?: (event: { target: YouTubePlayer }) => void
    onStateChange?: (event: { data: number; target: YouTubePlayer }) => void
    onError?: (event: { data: number; target: YouTubePlayer }) => void
  }
}

type YouTubeWindow = Window & {
  YT?: YouTubeNamespace
  onYouTubeIframeAPIReady?: () => void
}

let apiPromise: Promise<void> | null = null

export function loadYouTubeIframeApi() {
  const youtubeWindow = window as YouTubeWindow
  if (youtubeWindow.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise
  apiPromise = new Promise<void>((resolve, reject) => {
    const previous = youtubeWindow.onYouTubeIframeAPIReady
    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => {
      apiPromise = null
      reject(new Error('YouTube player failed to load'))
    }
    document.head.appendChild(script)
  })
  return apiPromise
}

export function createYouTubePlayer(
  element: HTMLElement,
  events: NonNullable<YouTubePlayerOptions['events']>,
  videoId = '',
) {
  const youtubeWindow = window as YouTubeWindow
  if (!youtubeWindow.YT?.Player) throw new Error('YouTube player is not loaded')
  return new youtubeWindow.YT.Player(element, {
    width: '100%',
    height: '100%',
    ...(videoId ? { videoId } : {}),
    playerVars: {
      ...(videoId ? { autoplay: 1 } : {}),
      controls: 0,
      rel: 0,
      playsinline: 1,
      origin: window.location.origin,
    },
    events,
  })
}
