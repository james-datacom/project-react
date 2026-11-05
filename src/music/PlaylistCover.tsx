import { coverFromTitle } from './cover.ts'
import type { Track } from './library.ts'
import { SongCover } from './SongCover.tsx'

export function PlaylistCover({ name, tracks }: { name: string; tracks: Track[] }) {
  const songs = tracks.slice(0, 4)
  if (songs.length === 0) {
    const cover = coverFromTitle(name)
    return (
      <span className="cover-tile music-playlist-avatar" style={{ background: cover.color }} aria-hidden="true">
        {cover.initials}
      </span>
    )
  }

  return (
    <span className="playlist-avatar-group" data-count={songs.length} aria-hidden="true">
      {songs.map((track) => (
        <SongCover key={track.id} videoId={track.videoId} title={track.title} className="cover-tile playlist-avatar-cell" />
      ))}
    </span>
  )
}
