import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { account } from '../content/placeholders.ts'
import { ProfileAvatar } from './ProfileAvatar.tsx'

export function ProfileMenu() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(location.pathname)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="profile-menu" ref={rootRef}>
      <button
        type="button"
        className="profile-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
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
            onClick={() => setOpen(false)}
          >
            Account settings
          </Link>
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={() => setOpen(false)}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
