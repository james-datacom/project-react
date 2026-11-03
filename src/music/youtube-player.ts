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

type YouTubePlayer = PlayerHandle & {
  destroy: () => void
}

type YouTubeNamespace = {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer
}

type YouTubePlayerOptions = {
  width?: string
  height?: string
  playerVars?: {
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
) {
  const youtubeWindow = window as YouTubeWindow
  if (!youtubeWindow.YT?.Player) throw new Error('YouTube player is not loaded')
  return new youtubeWindow.YT.Player(element, {
    width: '100%',
    height: '100%',
    playerVars: {
      controls: 0,
      rel: 0,
      playsinline: 1,
      origin: window.location.origin,
    },
    events,
  })
}
