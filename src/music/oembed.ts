export function youtubeOembedUrl(videoUrl: string) {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
}

export async function fetchYouTubeTitle(
  videoUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const response = await fetchImpl(youtubeOembedUrl(videoUrl))
    if (!response.ok) return null
    const body = (await response.json()) as { title?: unknown }
    if (typeof body.title !== 'string') return null
    const title = body.title.trim()
    return title || null
  } catch {
    return null
  }
}
