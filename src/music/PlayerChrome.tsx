import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useNarrow } from '../shell/useNarrow.ts'
import { AudioEngine } from './AudioEngine.tsx'
import { MiniPlayer } from './MiniPlayer.tsx'
import { MusicTabBar } from './MusicTabBar.tsx'
import { NowPlaying } from './NowPlaying.tsx'
import { useMusic } from './MusicProvider.tsx'
import { isMusicRoute } from './paths.ts'

export function PlayerChrome() {
  const location = useLocation()
  const narrow = useNarrow()
  const music = useMusic()
  const onMusic = isMusicRoute(location.pathname)
  const wideMusic = onMusic && !narrow

  useEffect(() => {
    if (wideMusic && music.nowPlayingOpen) music.closeNowPlaying()
  }, [music, wideMusic])

  if (!onMusic && !music.session) return null

  return (
    <>
      <AudioEngine />
      {music.session ? <MiniPlayer wideMusic={wideMusic} raised={onMusic} /> : null}
      {onMusic ? <MusicTabBar /> : null}
      {music.session && music.nowPlayingOpen && !wideMusic ? <NowPlaying presentation="sheet" /> : null}
    </>
  )
}
