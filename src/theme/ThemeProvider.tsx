import { useCallback, useState, type ReactNode } from 'react'
import { ThemeContext } from './theme-context.ts'
import { persistTheme, resolveTheme, type ThemeName } from './theme.ts'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => resolveTheme())

  const setTheme = useCallback((next: ThemeName) => {
    persistTheme(next)
    setThemeState(next)
  }, [])

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
}
