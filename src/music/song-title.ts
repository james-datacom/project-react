import { parseYouTubeVideoUrl } from './youtube-link.ts'

export type TitleLookup = { apply: false } | { apply: true; title: string }

export function linkToFetch(value: string): string | null {
  const parsed = parseYouTubeVideoUrl(value)
  if (!parsed.ok) return null
  return value.trim()
}

export function titleFromLookup(activeRequest: number, responseRequest: number, title: string | null): TitleLookup {
  if (activeRequest !== responseRequest) return { apply: false }
  return { apply: true, title: title ?? '' }
}

export function titleForSave(title: string): string | null {
  const next = title.trim()
  return next || null
}
