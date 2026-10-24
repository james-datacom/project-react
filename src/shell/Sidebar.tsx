import { NavLink } from 'react-router'
import { account, product } from '../content/placeholders.ts'
import { ProfileAvatar } from './ProfileAvatar.tsx'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects', end: false },
  { to: '/settings', label: 'Settings', end: false },
] as const

export function Sidebar({ hidden }: { hidden: boolean }) {
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
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className="nav-link"
              >
                <NavIcon name={item.label} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="account-row">
        <ProfileAvatar imageUrl={account.imageUrl} name={account.name} />
        <span className="account-name">{account.name}</span>
      </div>
    </aside>
  )
}

function NavIcon({ name }: { name: 'Home' | 'Projects' | 'Settings' }) {
  if (name === 'Home') {
    return (
      <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    )
  }

  if (name === 'Projects') {
    return (
      <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
      </svg>
    )
  }

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm8.2 3.1-1.7-.3a6.7 6.7 0 0 0-.7-1.6l1-1.4-1.6-1.6-1.4 1a6.7 6.7 0 0 0-1.6-.7L13.9 5h-2.2l-.3 1.7a6.7 6.7 0 0 0-1.6.7l-1.4-1-1.6 1.6 1 1.4a6.7 6.7 0 0 0-.7 1.6L5 11.3v2.2l1.7.3a6.7 6.7 0 0 0 .7 1.6l-1 1.4 1.6 1.6 1.4-1a6.7 6.7 0 0 0 1.6.7l.3 1.7h2.2l.3-1.7a6.7 6.7 0 0 0 1.6-.7l1.4 1 1.6-1.6-1-1.4a6.7 6.7 0 0 0 .7-1.6l1.7-.3v-2.2Z" />
    </svg>
  )
}
