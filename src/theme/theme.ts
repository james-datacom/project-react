export const themeStorageKey = 'theme'

export type ThemeName = 'light' | 'dark'

export function isThemeName(value: unknown): value is ThemeName {
  return value === 'light' || value === 'dark'
}

export function readStoredTheme(): ThemeName | null {
  try {
    const value = localStorage.getItem(themeStorageKey)
    return isThemeName(value) ? value : null
  } catch {
    return null
  }
}

export function resolveTheme(): ThemeName {
  return readStoredTheme() ?? 'dark'
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme
}

export function persistTheme(theme: ThemeName) {
  try {
    localStorage.setItem(themeStorageKey, theme)
  } catch {
    // Storage can be blocked; the choice still applies for this visit.
  }
  applyTheme(theme)
}
