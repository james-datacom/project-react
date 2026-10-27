import { useState } from 'react'
import {
  Calculator,
  ChevronDown,
  Folder,
  HeartPulse,
  House,
  Settings,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { account, product } from '../content/placeholders.ts'
import { ProfileAvatar } from './ProfileAvatar.tsx'

export const proteinCalculatorPath = '/health/protein-calculator'

export function Sidebar({ hidden }: { hidden: boolean }) {
  const { pathname } = useLocation()
  const forcedOpen = pathname === proteinCalculatorPath
  const [userExpanded, setUserExpanded] = useState(false)
  const [trackedPath, setTrackedPath] = useState(pathname)

  if (trackedPath !== pathname) {
    setTrackedPath(pathname)
    if (trackedPath === proteinCalculatorPath) setUserExpanded(false)
  }

  const expanded = forcedOpen || userExpanded

  function toggleHealth() {
    if (forcedOpen) return
    setUserExpanded((open) => !open)
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
              aria-expanded={expanded}
              onClick={toggleHealth}
            >
              <HeartPulse className="nav-icon" aria-hidden="true" />
              <span>Health</span>
              <ChevronDown className="nav-chevron" aria-hidden="true" />
            </button>
            {expanded ? (
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
