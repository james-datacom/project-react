import { useState } from 'react'
import { coverFromTitle, thumbnailUrl } from './cover.ts'

export function SongCover({
  videoId,
  title,
  className,
}: {
  videoId: string
  title: string
  className: string
}) {
  const cover = coverFromTitle(title)
  const [failedId, setFailedId] = useState('')
  const src = thumbnailUrl(videoId)
  const showImage = Boolean(src) && failedId !== videoId

  return (
    <span className={`${className} song-avatar`} style={showImage ? undefined : { background: cover.color }} aria-hidden="true">
      {showImage ? <img src={src} alt="" onError={() => setFailedId(videoId)} /> : cover.initials}
    </span>
  )
}
