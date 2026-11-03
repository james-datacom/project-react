import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useNarrow } from '../shell/useNarrow.ts'
import { AudioEngine } from './AudioEngine.tsx'
import { MiniPlayer } from './MiniPlayer.tsx'
import { NowPlaying } from './NowPlaying.tsx'
import { useMusic } from './MusicProvider.tsx'
import { isMusicRoute } from './paths.ts'

export function PlayerChrome() {
  const location = useLocation()
  const narrow = useNarrow()
  const music = useMusic()
  const wideMusic = isMusicRoute(location.pathname) && !narrow

  useEffect(() => {
    if (wideMusic && music.nowPlayingOpen) music.closeNowPlaying()
  }, [music, wideMusic])

  if (!music.session) return null

  return (
    <>
      <AudioEngine />
      <MiniPlayer wideMusic={wideMusic} />
      {music.nowPlayingOpen && !wideMusic ? <NowPlaying presentation="sheet" /> : null}
    </>
  )
}
