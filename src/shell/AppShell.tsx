import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { PlayerChrome } from '../music/PlayerChrome.tsx'
import { MusicProvider, useMusic } from '../music/MusicProvider.tsx'
import { isMusicRoute } from '../music/paths.ts'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'
import { useNarrow } from './useNarrow.ts'

export function AppShell() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPath, setSidebarPath] = useState(location.pathname)
  const narrow = useNarrow('(max-width: 48rem)')

  if (sidebarPath !== location.pathname) {
    setSidebarPath(location.pathname)
    setSidebarOpen(false)
  }

  if (!narrow && sidebarOpen) setSidebarOpen(false)

  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen])

  const overlayOpen = narrow && sidebarOpen

  return (
    <MusicProvider>
      <ShellFrame
        overlayOpen={overlayOpen}
        narrow={narrow}
        sidebarOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((open) => !open)}
        onClose={() => setSidebarOpen(false)}
      />
    </MusicProvider>
  )
}

function ShellFrame({
  overlayOpen,
  narrow,
  sidebarOpen,
  onMenuToggle,
  onClose,
}: {
  overlayOpen: boolean
  narrow: boolean
  sidebarOpen: boolean
  onMenuToggle: () => void
  onClose: () => void
}) {
  const { session } = useMusic()
  const onMusic = isMusicRoute(useLocation().pathname)

  return (
    <div
      className="shell"
      data-sidebar-open={overlayOpen ? 'true' : 'false'}
      data-player={session ? 'true' : 'false'}
      data-music-nav={onMusic ? 'true' : 'false'}
    >
      <Sidebar hidden={narrow && !sidebarOpen} />
      {overlayOpen ? (
        <button type="button" className="backdrop" aria-label="Close menu" onClick={onClose} />
      ) : null}
      <Header menuOpen={overlayOpen} showMenuButton={narrow} onMenuToggle={onMenuToggle} />
      <main className="shell-body">
        <Outlet />
      </main>
      <PlayerChrome />
    </div>
  )
}
