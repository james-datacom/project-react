import { ChevronDown, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import { SongCover } from './SongCover.tsx'
import { QueueSheet } from './QueueSheet.tsx'
import { useMusic } from './MusicProvider.tsx'

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const remain = total % 60
  return `${minutes}:${remain.toString().padStart(2, '0')}`
}

export function NowPlaying({ presentation }: { presentation: 'sheet' | 'column' }) {
  const music = useMusic()
  const startY = useRef<number | null>(null)
  const session = music.session
  if (!session || session.trackIds.length === 0) return null

  const playlist = music.library.playlists.find((item) => item.id === session.playlistId)
  const trackId = session.trackIds[session.index]
  const track = playlist?.tracks.find((item) => item.id === trackId)
  const remaining = Math.max(0, music.duration - music.currentTime)

  function onPointerDown(event: PointerEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('button, input, a, .queue-list')) return
    startY.current = event.clientY
  }

  function onPointerUp(event: PointerEvent) {
    if (startY.current == null) return
    const delta = event.clientY - startY.current
    startY.current = null
    if (music.queueOpen && delta >= 48) music.closeQueue()
    else if (!music.queueOpen && delta <= -48) music.openQueue()
  }

  function closeSheet() {
    music.closeNowPlaying()
    document.getElementById('mini-player-open')?.focus()
  }

  return (
    <section
      className={presentation === 'sheet' ? 'now-playing now-playing-sheet' : 'now-playing now-playing-column'}
      aria-label="Now playing"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {presentation === 'sheet' ? (
        <button type="button" className="now-playing-close icon-button" aria-label="Close" onClick={closeSheet}>
          <ChevronDown className="player-icon" />
        </button>
      ) : null}
      <SongCover videoId={track?.videoId ?? ''} title={track?.title ?? ''} className="cover-tile cover-tile-lg" />
      <p className="now-playing-title">{track?.title ?? ''}</p>
      <p className="now-playing-playlist">{playlist?.name ?? ''}</p>
      <div className="now-playing-seek">
        <span>{formatTime(music.currentTime)}</span>
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={music.duration || 0}
          step={0.1}
          value={Math.min(music.currentTime, music.duration || 0)}
          onChange={(event) => music.seek(Number(event.target.value))}
        />
        <span>{formatTime(remaining)}</span>
      </div>
      <div className="transport">
        <div className="transport-main">
          <button
            type="button"
            className={music.shuffle ? 'icon-button is-on' : 'icon-button'}
            aria-label={music.shuffle ? 'Shuffle on' : 'Shuffle off'}
            aria-pressed={music.shuffle}
            onClick={music.toggleShuffle}
          >
            <Shuffle className="player-icon" />
          </button>
          <button type="button" className="icon-button" aria-label="Previous" onClick={music.goPrevious}>
            <SkipBack className="player-icon" />
          </button>
          <button
            type="button"
            className="icon-button transport-play"
            aria-label={session.paused ? 'Play' : 'Pause'}
            onClick={music.togglePlay}
          >
            {session.paused ? <Play className="player-icon player-icon-lg" /> : <Pause className="player-icon player-icon-lg" />}
          </button>
          <button type="button" className="icon-button" aria-label="Next" onClick={music.goNext}>
            <SkipForward className="player-icon" />
          </button>
          <button
            type="button"
            className={music.repeat === 'off' ? 'icon-button' : 'icon-button is-on'}
            aria-label={`Repeat ${music.repeat}`}
            aria-pressed={music.repeat !== 'off'}
            onClick={music.cycleRepeatMode}
          >
            {music.repeat === 'one' ? <Repeat1 className="player-icon" /> : <Repeat className="player-icon" />}
          </button>
        </div>
        <div className="transport-volume">
          <input
            type="range"
            aria-label="Volume"
            min={0}
            max={100}
            step={1}
            value={music.volume}
            onChange={(event) => music.setVolume(Number(event.target.value))}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={music.muted ? 'Unmute' : 'Mute'}
            aria-pressed={music.muted}
            onClick={music.toggleMute}
          >
            {music.muted ? <VolumeX className="player-icon" /> : <Volume2 className="player-icon" />}
          </button>
        </div>
      </div>
      <button
        type="button"
        className="up-next"
        aria-expanded={music.queueOpen}
        aria-controls="up-next-sheet"
        onClick={() => (music.queueOpen ? music.closeQueue() : music.openQueue())}
      >
        <span className="up-next-handle" aria-hidden="true" />
        Up next
      </button>
      {music.queueOpen ? <QueueSheet /> : null}
    </section>
  )
}
