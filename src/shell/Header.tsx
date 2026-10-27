import { useLocation } from 'react-router'
import { ProfileMenu } from './ProfileMenu.tsx'

const titles: Record<string, string> = {
  '/': 'Home',
  '/projects': 'Projects',
  '/settings': 'Settings',
  '/account': 'Account settings',
  '/health/protein-calculator': 'Protein Calculator',
}

type HeaderProps = {
  menuOpen: boolean
  showMenuButton: boolean
  onMenuToggle: () => void
}

export function Header({ menuOpen, showMenuButton, onMenuToggle }: HeaderProps) {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Home'

  return (
    <header className="header">
      <div className="header-start">
        {showMenuButton ? (
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            onClick={onMenuToggle}
          >
            <svg className="menu-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span className="visually-hidden">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </span>
          </button>
        ) : null}
        <h1 className="page-title">{title}</h1>
      </div>
      <ProfileMenu />
    </header>
  )
}
