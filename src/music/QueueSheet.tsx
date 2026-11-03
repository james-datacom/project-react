import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useMusic } from './MusicProvider.tsx'

export function QueueSheet() {
  const music = useMusic()
  const session = music.session

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') music.closeQueue()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [music])

  if (!session || session.trackIds.length === 0) return null
  const playlist = music.library.playlists.find((item) => item.id === session.playlistId)
  const rows = session.trackIds.map((id, index) => ({
    id,
    index,
    title: playlist?.tracks.find((track) => track.id === id)?.title ?? 'Untitled',
    failed: session.failedIds.includes(id) || music.unavailableIds.includes(id),
  }))
  const current = rows[session.index]
  const upcoming = rows.slice(session.index + 1)

  return (
    <div id="up-next-sheet" className="queue-sheet" role="dialog" aria-labelledby="up-next-title">
      <div className="queue-sheet-bar">
        <h2 id="up-next-title">Up next</h2>
        <button type="button" className="icon-button" aria-label="Close" onClick={() => music.closeQueue()}>
          <X className="player-icon" />
        </button>
      </div>
      <div className="queue-list">
        <h3>Now playing</h3>
        {current ? <p aria-current="true">{current.title}</p> : null}
        {current?.failed ? <p role="alert">This video is unavailable.</p> : null}
        <h3>Next</h3>
        <ul>
          {upcoming.map((row) => (
            <li key={`${row.id}-${row.index}`}>
              <button type="button" onClick={() => music.playAt(row.index)}>
                {row.title}
              </button>
              {row.failed ? <p role="alert">This video is unavailable.</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
