import type { SearchHit, SearchKind } from './youtube-search.ts'
import type { LibraryStorage } from './storage.ts'

export const MUSIC_SEARCH_RECENTS_KEY = 'music-search-recents'

export type RecentItem = SearchHit & { added?: boolean }

function isKind(value: unknown): value is SearchKind {
  return value === 'song' || value === 'artist' || value === 'playlist'
}

function parseItem(value: unknown): RecentItem[] {
  if (!value || typeof value !== 'object') return []
  const item = value as RecentItem
  if (!isKind(item.kind) || typeof item.id !== 'string' || !item.id) return []
  if (typeof item.title !== 'string' || !item.title) return []
  return [
    {
      kind: item.kind,
      id: item.id,
      title: item.title,
      artist: typeof item.artist === 'string' ? item.artist : '',
      artworkUrl: typeof item.artworkUrl === 'string' ? item.artworkUrl : '',
      added: item.added === true,
    },
  ]
}

export function parseRecents(raw: string | null): RecentItem[] {
  if (!raw) return []
  try {
    const value = JSON.parse(raw) as { items?: unknown }
    if (!value || typeof value !== 'object' || !Array.isArray(value.items)) return []
    return value.items.flatMap(parseItem)
  } catch {
    return []
  }
}

export function loadRecents(storage: LibraryStorage): RecentItem[] {
  try {
    return parseRecents(storage.getItem(MUSIC_SEARCH_RECENTS_KEY))
  } catch {
    return []
  }
}

export function saveRecents(storage: LibraryStorage, items: RecentItem[]) {
  storage.setItem(MUSIC_SEARCH_RECENTS_KEY, JSON.stringify({ items }))
}

export function mergeRecents(current: RecentItem[], hits: SearchHit[]): RecentItem[] {
  let next = current
  for (const hit of [...hits].reverse()) {
    const existing = next.find((item) => item.kind === hit.kind && item.id === hit.id)
    const item: RecentItem = { ...hit, added: existing?.added === true }
    next = [item, ...next.filter((entry) => !(entry.kind === hit.kind && entry.id === hit.id))]
  }
  return next.slice(0, 50)
}

export function removeRecent(items: RecentItem[], kind: SearchKind, id: string) {
  return items.filter((item) => !(item.kind === kind && item.id === id))
}

export function markAdded(items: RecentItem[], kind: SearchKind, id: string) {
  if (kind === 'song') return items
  return items.map((item) => (item.kind === kind && item.id === id ? { ...item, added: true } : item))
}
