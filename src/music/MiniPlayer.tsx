import { Pause, Play } from 'lucide-react'
import { coverFromTitle } from './cover.ts'
import { SongCover } from './SongCover.tsx'
import { useMusic } from './MusicProvider.tsx'

export function MiniPlayer({ wideMusic, raised = false }: { wideMusic: boolean; raised?: boolean }) {
  const music = useMusic()
  const session = music.session
  if (!session) return null
  const playlist = music.library.playlists.find((item) => item.id === session.playlistId)
  const trackId = session.trackIds[session.index]
  const track = playlist?.tracks.find((item) => item.id === trackId)
  const cover = coverFromTitle(track?.title ?? '')
  const playing = !session.paused
  const progress = music.duration > 0 ? Math.min(100, (music.currentTime / music.duration) * 100) : 0

  function openNowPlaying() {
    if (wideMusic) {
      document.getElementById('now-playing-column')?.focus()
      return
    }
    music.openNowPlaying()
  }

  return (
    <div
      className={raised ? 'mini-player is-raised' : 'mini-player'}
      style={{ background: `color-mix(in srgb, ${cover.color} 68%, #140810)` }}
    >
      <div className="mini-player-progress" aria-hidden="true" style={{ width: `${progress}%` }} />
      <button type="button" id="mini-player-open" className="mini-player-open" onClick={openNowPlaying}>
        <SongCover videoId={track?.videoId ?? ''} title={track?.title ?? ''} className="cover-tile cover-tile-sm" />
        <span className="mini-player-copy">
          <span className="mini-player-title">{track?.title ?? ''}</span>
          <span className="mini-player-playlist">{playlist?.name ?? ''}</span>
        </span>
        <span className="visually-hidden">Open now playing</span>
      </button>
      <button
        type="button"
        className="mini-player-toggle icon-button"
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={() => music.togglePlay()}
      >
        {playing ? <Pause className="player-icon" /> : <Play className="player-icon" />}
      </button>
    </div>
  )
}
