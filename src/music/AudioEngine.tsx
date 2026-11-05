import { useEffect, useRef, useState } from 'react'
import { useMusic } from './MusicProvider.tsx'
import {
  createYouTubePlayer,
  initialPlaybackVideo,
  loadYouTubeIframeApi,
  playFromCue,
  playbackStarted,
  trackEnded,
  type PlayerHandle,
} from './youtube-player.ts'

export function AudioEngine() {
  const { command, session, reportTime, reportEnded, reportError, registerPlayer } = useMusic()
  const hostRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<PlayerHandle | null>(null)
  const endedRef = useRef(reportEnded)
  const errorRef = useRef(reportError)
  const registerRef = useRef(registerPlayer)
  const commandRef = useRef(command)
  const pausedRef = useRef(session?.paused ?? true)
  const [ready, setReady] = useState(false)
  const [apiFailed, setApiFailed] = useState(false)
  const startedRef = useRef(false)
  const wantsPlayRef = useRef(false)
  const appliedNonceRef = useRef<number | null>(null)

  useEffect(() => {
    commandRef.current = command
    pausedRef.current = session?.paused ?? true
  }, [command, session])

  useEffect(() => {
    endedRef.current = reportEnded
    errorRef.current = reportError
    registerRef.current = registerPlayer
  }, [reportEnded, reportError, registerPlayer])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let player: { destroy: () => void } | null = null
    loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !hostRef.current) return
        const pending = commandRef.current
        const videoId = initialPlaybackVideo(pending, pausedRef.current)
        if (pending && videoId) {
          startedRef.current = false
          wantsPlayRef.current = true
          appliedNonceRef.current = pending.nonce
        }
        player = createYouTubePlayer(hostRef.current, {
          onReady: (event) => {
            if (cancelled) return
            const handle: PlayerHandle = event.target
            handleRef.current = handle
            registerRef.current(handle)
            const current = commandRef.current
            if (
              current &&
              !pausedRef.current &&
              wantsPlayRef.current &&
              appliedNonceRef.current === current.nonce
            ) {
              handle.playVideo()
            }
            setReady(true)
          },
          onStateChange: (event) => {
            if (playFromCue(event.data, wantsPlayRef.current) && !pausedRef.current) event.target.playVideo()
            if (trackEnded(event.data, startedRef.current)) {
              startedRef.current = false
              endedRef.current()
              return
            }
            startedRef.current = playbackStarted(event.data, startedRef.current)
          },
          onError: () => errorRef.current(),
        }, videoId)
      })
      .catch(() => {
        if (!cancelled) setApiFailed(true)
      })
    return () => {
      cancelled = true
      registerRef.current(null)
      handleRef.current = null
      try {
        player?.destroy()
      } catch {
        // The iframe API can throw if the player is destroyed before it is ready.
      }
    }
  }, [])

  useEffect(() => {
    const handle = handleRef.current
    if (!ready || !command || !handle || appliedNonceRef.current === command.nonce) return
    if (command.action === 'load' && command.videoId) {
      startedRef.current = false
      wantsPlayRef.current = true
      handle.loadVideoById(command.videoId)
      handle.playVideo()
    }
    if (command.action === 'resume') {
      wantsPlayRef.current = true
      handle.playVideo()
    }
    if (command.action === 'pause') {
      wantsPlayRef.current = false
      handle.pauseVideo()
    }
    if (command.action === 'seek-start') {
      startedRef.current = false
      wantsPlayRef.current = true
      handle.seekTo(0, true)
      handle.playVideo()
    }
  }, [command, ready])

  useEffect(() => {
    if (!session || session.paused) return
    const timer = window.setInterval(() => {
      const handle = handleRef.current
      if (!handle) return
      reportTime(handle.getCurrentTime() || 0, handle.getDuration() || 0)
    }, 250)
    return () => window.clearInterval(timer)
  }, [session, reportTime])

  return (
    <>
      <div className="audio-engine" ref={hostRef} aria-hidden="true" />
      {apiFailed ? <p className="player-unavailable" role="alert">Playback is unavailable.</p> : null}
    </>
  )
}
