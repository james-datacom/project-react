const videoIdPattern = /^[A-Za-z0-9_-]{11}$/

export type YouTubeParseResult =
  | { ok: true; videoId: string }
  | { ok: false; error: string }

function reject(error = 'Enter a single YouTube video link.'): YouTubeParseResult {
  return { ok: false, error }
}

function canonicalHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, '')
}

function videoIdFromPath(pathname: string, marker: 'shorts' | 'embed') {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] !== marker) return null
  const videoId = parts[1] ?? ''
  return videoIdPattern.test(videoId) ? videoId : null
}

export function parseYouTubeVideoUrl(input: string): YouTubeParseResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: 'Enter a YouTube video link.' }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return reject()
  }

  const host = canonicalHost(url.hostname)
  if (host === 'youtu.be') {
    const videoId = url.pathname.split('/').filter(Boolean)[0] ?? ''
    return videoIdPattern.test(videoId) ? { ok: true, videoId } : reject()
  }

  if (host !== 'youtube.com' && host !== 'music.youtube.com') return reject()

  const parts = url.pathname.split('/').filter(Boolean)
  if (parts[0] === 'watch') {
    const videoId = url.searchParams.get('v') ?? ''
    return videoIdPattern.test(videoId) ? { ok: true, videoId } : reject()
  }

  if (host === 'youtube.com') {
    const fromShorts = videoIdFromPath(url.pathname, 'shorts')
    if (fromShorts) return { ok: true, videoId: fromShorts }
    const fromEmbed = videoIdFromPath(url.pathname, 'embed')
    if (fromEmbed) return { ok: true, videoId: fromEmbed }
  }

  return reject()
}
