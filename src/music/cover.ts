export const coverPalette = ['#3b5bdb', '#7048e8', '#0b7285', '#c2410c', '#9d174d', '#1d4ed8']

function hashTitle(title: string) {
  let hash = 0
  for (let index = 0; index < title.length; index += 1) {
    hash = (hash * 31 + title.charCodeAt(index)) >>> 0
  }
  return hash
}

export function thumbnailUrl(videoId: string) {
  if (!videoId) return ''
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export function coverFromTitle(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean)
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : (words[0] ?? '').slice(0, 2).toUpperCase()
  const color = coverPalette[hashTitle(title) % coverPalette.length]
  return { initials, color }
}
