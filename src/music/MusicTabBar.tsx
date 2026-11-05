import { House, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { CreatePlaylistDialog } from './CreatePlaylistDialog.tsx'
import { musicPath, musicSearchPath } from './paths.ts'

export function MusicTabBar() {
  const { pathname } = useLocation()
  const [creating, setCreating] = useState(false)
  const homeCurrent = pathname !== musicSearchPath

  return (
    <>
      <nav className="music-tab-bar" aria-label="Music">
        <Link to={musicPath} className="music-tab" aria-current={homeCurrent ? 'page' : undefined}>
          <House className="music-tab-icon" aria-hidden="true" />
          <span>Home</span>
        </Link>
        <NavLink to={musicSearchPath} className="music-tab">
          <Search className="music-tab-icon" aria-hidden="true" />
          <span>Search</span>
        </NavLink>
        <button type="button" className="music-tab" onClick={() => setCreating(true)}>
          <Plus className="music-tab-icon" aria-hidden="true" />
          <span>Create</span>
        </button>
      </nav>
      {creating ? <CreatePlaylistDialog onClose={() => setCreating(false)} /> : null}
    </>
  )
}
