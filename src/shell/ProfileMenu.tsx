import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { account } from '../content/placeholders.ts'
import type { ThemeName } from '../theme/theme.ts'
import { useTheme } from '../theme/useTheme.ts'
import { ProfileAvatar } from './ProfileAvatar.tsx'

export function ProfileMenu() {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [themePinned, setThemePinned] = useState(false)
  const [menuPath, setMenuPath] = useState(location.pathname)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const themeMenuId = useId()

  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname)
    setOpen(false)
    setThemeOpen(false)
    setThemePinned(false)
  }

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setThemeOpen(false)
        setThemePinned(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setThemeOpen(false)
        setThemePinned(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function closeMenu() {
    setOpen(false)
    setThemeOpen(false)
    setThemePinned(false)
  }

  function hoverCapable() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }

  function onThemeClick() {
    const next = !themePinned
    setThemePinned(next)
    setThemeOpen(next)
  }

  function chooseTheme(next: ThemeName) {
    setTheme(next)
  }

  const activeTheme = theme === 'dark' ? 'Dark' : 'Light'

  return (
    <div className="profile-menu" ref={rootRef}>
      <button
        type="button"
        className="profile-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((value) => {
            const next = !value
            if (!next) {
              setThemeOpen(false)
              setThemePinned(false)
            }
            return next
          })
        }}
      >
        <ProfileAvatar imageUrl={account.imageUrl} name={account.name} />
        <span className="visually-hidden">Account menu</span>
      </button>
      {open ? (
        <div id={menuId} role="menu" className="menu">
          <Link
            role="menuitem"
            className="menu-item"
            to="/account"
            onClick={closeMenu}
          >
            <UserIcon />
            Account settings
          </Link>
          <div
            className="menu-branch"
            onPointerEnter={() => {
              if (hoverCapable()) setThemeOpen(true)
            }}
            onPointerLeave={() => {
              if (hoverCapable() && !themePinned) setThemeOpen(false)
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="menu-item"
              aria-haspopup="menu"
              aria-expanded={themeOpen}
              aria-controls={themeMenuId}
              onClick={onThemeClick}
            >
              <PaletteIcon />
              <span>Theme</span>
              <span className="menu-item-meta">
                {activeTheme}
                <ChevronRightIcon />
              </span>
            </button>
            {themeOpen ? (
              <div
                id={themeMenuId}
                role="menu"
                aria-label="Theme"
                className="menu menu-sub"
              >
                <button
                  type="button"
                  role="menuitemradio"
                  className="menu-item"
                  aria-checked={theme === 'light'}
                  onClick={() => chooseTheme('light')}
                >
                  <ThemeMark selected={theme === 'light'} />
                  <SunIcon />
                  Light Mode
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  className="menu-item"
                  aria-checked={theme === 'dark'}
                  onClick={() => chooseTheme('dark')}
                >
                  <ThemeMark selected={theme === 'dark'} />
                  <MoonIcon />
                  Dark Mode
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={closeMenu}
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}

function ThemeMark({ selected }: { selected: boolean }) {
  if (!selected) return <span className="menu-check" aria-hidden="true" />
  return <CheckIcon />
}

function Glyph({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <svg
      className={className ? `menu-glyph ${className}` : 'menu-glyph'}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function UserIcon() {
  return (
    <Glyph>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.25a6.5 6.5 0 0 1 13 0" />
    </Glyph>
  )
}

function PaletteIcon() {
  return (
    <Glyph>
      <path d="M12 3.8a8.2 8.2 0 0 0 0 16.4h.5a1.7 1.7 0 0 0 1.7-1.7 1.7 1.7 0 0 1 1.7-1.7H18a3.4 3.4 0 0 0 0-6.8A8.2 8.2 0 0 0 12 3.8Z" />
      <circle cx="7.8" cy="10.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="10.6" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.8" cy="8.3" r="0.9" fill="currentColor" stroke="none" />
    </Glyph>
  )
}

function LogoutIcon() {
  return (
    <Glyph>
      <path d="M14 7V5.8A1.8 1.8 0 0 0 12.2 4H5.8A1.8 1.8 0 0 0 4 5.8v12.4A1.8 1.8 0 0 0 5.8 20h6.4A1.8 1.8 0 0 0 14 18.2V17" />
      <path d="M10 12h10" />
      <path d="M16.5 8.5 20 12l-3.5 3.5" />
    </Glyph>
  )
}

function SunIcon() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.2v2M12 18.8v2M3.2 12h2M18.8 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </Glyph>
  )
}

function MoonIcon() {
  return (
    <Glyph>
      <path d="M16.5 14.8A6.4 6.4 0 0 1 9.2 4.6 7 7 0 1 0 16.5 14.8Z" />
    </Glyph>
  )
}

function CheckIcon() {
  return (
    <Glyph className="menu-check">
      <path d="M5 12.5 9.5 17 19 7.5" />
    </Glyph>
  )
}

function ChevronRightIcon() {
  return (
    <Glyph className="menu-chevron">
      <path d="m9 6 6 6-6 6" />
    </Glyph>
  )
}
