import { coverFromTitle } from './cover.ts'
import { useMusic } from './MusicProvider.tsx'

export function MiniPlayer({ wideMusic }: { wideMusic: boolean }) {
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
    <div className="mini-player">
      <div className="mini-player-progress" aria-hidden="true" style={{ width: `${progress}%` }} />
      <button type="button" id="mini-player-open" className="mini-player-open" onClick={openNowPlaying}>
        <span className="cover-tile cover-tile-sm" style={{ background: cover.color }} aria-hidden="true">
          {cover.initials}
        </span>
        <span className="mini-player-copy">
          <span className="mini-player-title">{track?.title ?? ''}</span>
          <span className="mini-player-playlist">{playlist?.name ?? ''}</span>
        </span>
        <span className="visually-hidden">Open now playing</span>
      </button>
      <button type="button" className="mini-player-toggle" onClick={() => music.togglePlay()}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}
