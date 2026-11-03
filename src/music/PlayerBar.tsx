import { useEffect, useRef, useState } from 'react'
import { useMusic } from './MusicProvider.tsx'
import { musicPath } from './paths.ts'
import { createYouTubePlayer, loadYouTubeIframeApi, type PlayerHandle } from './youtube-player.ts'

export function PlayerBar({ compact }: { compact: boolean }) {
  const music = useMusic()
  const { command, session, reportTime, reportEnded, reportError, registerPlayer } = music
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

  const playlist = music.library.playlists.find((item) => item.id === music.session?.playlistId)
  const trackId = music.session ? music.session.trackIds[music.session.index] : undefined
  const track = playlist?.tracks.find((item) => item.id === trackId)
  const selected = music.library.playlists.find((item) => item.id === music.selectedId)
  const playDisabled = music.session ? !music.session.paused : !selected || selected.tracks.length === 0
  const pauseDisabled = !music.session || music.session.paused

  return (
    <section
      className={compact ? 'player-bar player-bar-compact' : 'player-bar'}
      aria-label="Music player"
      data-route={compact ? 'compact' : musicPath}
    >
      <div className="player-frame">
        <div ref={hostRef} />
      </div>
      <div className="player-panel">
        <p className="player-now">{track ? track.title : 'Nothing playing'}</p>
        <p className="player-playlist">{playlist?.name ?? selected?.name ?? ''}</p>
        {apiFailed ? <p role="alert">Playback is unavailable.</p> : null}
        <div className="player-controls">
          <button type="button" onClick={music.togglePlay} disabled={playDisabled}>
            Play
          </button>
          <button type="button" onClick={music.pause} disabled={pauseDisabled}>
            Pause
          </button>
          <button type="button" onClick={music.goPrevious} disabled={!music.session}>
            Previous
          </button>
          <button type="button" onClick={music.goNext} disabled={!music.session}>
            Next
          </button>
          <input
            type="range"
            aria-label="Seek"
            min={0}
            max={music.duration || 0}
            step={0.1}
            value={Math.min(music.currentTime, music.duration || 0)}
            disabled={!music.session}
            onChange={(event) => music.seek(Number(event.target.value))}
          />
          <input
            type="range"
            aria-label="Volume"
            min={0}
            max={100}
            step={1}
            value={music.volume}
            onChange={(event) => music.setVolume(Number(event.target.value))}
          />
          <button type="button" onClick={music.toggleMute} aria-pressed={music.muted}>
            {music.muted ? 'Unmute' : 'Mute'}
          </button>
          <button type="button" onClick={music.cycleRepeatMode}>
            Repeat {music.repeat}
          </button>
          <button type="button" onClick={music.toggleShuffle} aria-pressed={music.shuffle}>
            Shuffle
          </button>
        </div>
      </div>
    </section>
  )
}
