import { useState } from 'react'
import {
  Calculator,
  ChevronDown,
  Clapperboard,
  Folder,
  HeartPulse,
  House,
  Music,
  Settings,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { account, product } from '../content/placeholders.ts'
import { isMusicRoute, musicPath } from '../music/paths.ts'
import { ProfileAvatar } from './ProfileAvatar.tsx'

export const proteinCalculatorPath = '/health/protein-calculator'

export function Sidebar({
  hidden,
  initialEntertainmentOpen = false,
}: {
  hidden: boolean
  initialEntertainmentOpen?: boolean
}) {
  const { pathname } = useLocation()
  const healthForced = pathname === proteinCalculatorPath
  const musicForced = isMusicRoute(pathname)
  const [healthOpen, setHealthOpen] = useState(false)
  const [musicOpen, setMusicOpen] = useState(initialEntertainmentOpen)
  const [trackedPath, setTrackedPath] = useState(pathname)

  if (trackedPath !== pathname) {
    setTrackedPath(pathname)
    if (trackedPath === proteinCalculatorPath) setHealthOpen(false)
    if (isMusicRoute(trackedPath)) setMusicOpen(false)
  }

  const healthExpanded = healthForced || healthOpen
  const musicExpanded = musicForced || musicOpen

  function toggleHealth() {
    if (healthForced) return
    setHealthOpen((open) => !open)
  }

  function toggleEntertainment() {
    if (musicForced) return
    setMusicOpen((open) => !open)
  }

  return (
    <aside className="sidebar" id="app-sidebar" inert={hidden ? true : undefined}>
      <div className="brand">
        <span className="monogram" aria-hidden="true">
          {product.monogram}
        </span>
        <span className="product-name">{product.name}</span>
      </div>
      <nav className="nav" aria-label="Primary">
        <ul className="nav-list">
          <li>
            <NavLink to="/" end className="nav-link">
              <House className="nav-icon" aria-hidden="true" />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <button
              type="button"
              className="nav-link nav-group"
              aria-expanded={healthExpanded}
              onClick={toggleHealth}
            >
              <HeartPulse className="nav-icon" aria-hidden="true" />
              <span>Health</span>
              <ChevronDown className="nav-chevron" aria-hidden="true" />
            </button>
            {healthExpanded ? (
              <ul className="nav-children">
                <li>
                  <NavLink to={proteinCalculatorPath} className="nav-link nav-child">
                    <Calculator className="nav-icon" aria-hidden="true" />
                    <span>Protein Calculator</span>
                  </NavLink>
                </li>
              </ul>
            ) : null}
          </li>
          <li>
            <button
              type="button"
              className="nav-link nav-group"
              aria-expanded={musicExpanded}
              onClick={toggleEntertainment}
            >
              <Clapperboard className="nav-icon" aria-hidden="true" />
              <span>Entertainment</span>
              <ChevronDown className="nav-chevron" aria-hidden="true" />
            </button>
            {musicExpanded ? (
              <ul className="nav-children">
                <li>
                  <NavLink to={musicPath} className="nav-link nav-child">
                    <Music className="nav-icon" aria-hidden="true" />
                    <span>Music</span>
                  </NavLink>
                </li>
              </ul>
            ) : null}
          </li>
          <li>
            <NavLink to="/projects" className="nav-link">
              <Folder className="nav-icon" aria-hidden="true" />
              <span>Projects</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className="nav-link">
              <Settings className="nav-icon" aria-hidden="true" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="account-row">
        <ProfileAvatar imageUrl={account.imageUrl} name={account.name} />
        <span className="account-name">{account.name}</span>
      </div>
    </aside>
  )
}
