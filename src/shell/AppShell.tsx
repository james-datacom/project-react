import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'

const narrowQuery = '(max-width: 48rem)'

export function AppShell() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPath, setSidebarPath] = useState(location.pathname)
  const [narrow, setNarrow] = useState(() =>
    window.matchMedia(narrowQuery).matches,
  )

  if (sidebarPath !== location.pathname) {
    setSidebarPath(location.pathname)
    setSidebarOpen(false)
  }

  useEffect(() => {
    const media = window.matchMedia(narrowQuery)
    const onChange = () => {
      setNarrow(media.matches)
      if (!media.matches) setSidebarOpen(false)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

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
    <div className="shell" data-sidebar-open={overlayOpen ? 'true' : 'false'}>
      <Sidebar hidden={narrow && !sidebarOpen} />
      {overlayOpen ? (
        <button
          type="button"
          className="backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Header
        menuOpen={overlayOpen}
        showMenuButton={narrow}
        onMenuToggle={() => setSidebarOpen((open) => !open)}
      />
      <main className="shell-body">
        <Outlet />
      </main>
    </div>
  )
}
