export type SearchKind = 'song' | 'artist' | 'playlist'

export type SearchHit = {
  kind: SearchKind
  id: string
  title: string
  artist: string
  artworkUrl: string
}

export type SearchOutcome = { ok: true; items: SearchHit[] } | { ok: false }

type Thumbnail = { url?: unknown }
type Snippet = {
  title?: unknown
  channelTitle?: unknown
  thumbnails?: { medium?: Thumbnail; default?: Thumbnail }
}
type SearchItem = {
  id?: { kind?: unknown; videoId?: unknown; channelId?: unknown; playlistId?: unknown }
  snippet?: Snippet
}

export function shouldSearch(query: string) {
  return query.trim().length > 0
}

export function isCurrentSearch(requested: string, current: string) {
  return requested === current.trim()
}

export function youtubeSearchUrl(query: string, key: string) {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video,channel,playlist',
    maxResults: '10',
    q: query,
    key,
  })
  return `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function artworkUrl(snippet: Snippet | undefined) {
  const medium = snippet?.thumbnails?.medium?.url
  if (typeof medium === 'string' && medium) return medium
  const fallback = snippet?.thumbnails?.default?.url
  return typeof fallback === 'string' ? fallback : ''
}

function parseItem(value: unknown): SearchHit[] {
  if (!value || typeof value !== 'object') return []
  const item = value as SearchItem
  const snippet = item.snippet
  const kind = item.id?.kind
  const art = artworkUrl(snippet)
  if (kind === 'youtube#video') {
    const id = text(item.id?.videoId)
    const title = text(snippet?.title)
    if (!id || !title) return []
    return [{ kind: 'song', id, title, artist: text(snippet?.channelTitle), artworkUrl: art }]
  }
  if (kind === 'youtube#channel') {
    const id = text(item.id?.channelId)
    const title = text(snippet?.channelTitle) || text(snippet?.title)
    if (!id || !title) return []
    return [{ kind: 'artist', id, title, artist: '', artworkUrl: art }]
  }
  if (kind === 'youtube#playlist') {
    const id = text(item.id?.playlistId)
    const title = text(snippet?.title)
    if (!id || !title) return []
    return [{ kind: 'playlist', id, title, artist: '', artworkUrl: art }]
  }
  return []
}

export async function fetchYouTubeSearch(
  query: string,
  key: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SearchOutcome> {
  if (!key) return { ok: false }
  try {
    const response = await fetchImpl(youtubeSearchUrl(query, key))
    if (!response.ok) return { ok: false }
    const body = (await response.json()) as { items?: unknown }
    const items = Array.isArray(body.items) ? body.items.flatMap(parseItem) : []
    return { ok: true, items }
  } catch {
    return { ok: false }
  }
}
