import { useEffect, useRef, useState } from 'react'
import { useMusic } from './MusicProvider.tsx'
import { createYouTubePlayer, loadYouTubeIframeApi, type PlayerHandle } from './youtube-player.ts'

export function AudioEngine() {
  const { command, session, reportTime, reportEnded, reportError, registerPlayer } = useMusic()
  const hostRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<PlayerHandle | null>(null)
  const endedRef = useRef(reportEnded)
  const errorRef = useRef(reportError)
  const registerRef = useRef(registerPlayer)
  const [ready, setReady] = useState(false)
  const [apiFailed, setApiFailed] = useState(false)

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
        player = createYouTubePlayer(hostRef.current, {
          onReady: (event) => {
            if (cancelled) return
            const handle: PlayerHandle = event.target
            handleRef.current = handle
            registerRef.current(handle)
            setReady(true)
          },
          onStateChange: (event) => {
            if (event.data === 0) endedRef.current()
          },
          onError: () => errorRef.current(),
        })
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
    if (!ready || !command || !handle) return
    if (command.action === 'load' && command.videoId) handle.loadVideoById(command.videoId)
    if (command.action === 'resume') handle.playVideo()
    if (command.action === 'pause') handle.pauseVideo()
    if (command.action === 'seek-start') {
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
