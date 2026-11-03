export const musicPath = '/entertainment/music'

export function playlistPath(playlistId: string) {
  return `${musicPath}/${playlistId}`
}

export function isMusicRoute(pathname: string) {
  return pathname === musicPath || pathname.startsWith(`${musicPath}/`)
}
