import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import mainSource from '../main.tsx?raw'
import { ThemeProvider } from '../theme/ThemeProvider.tsx'
import shellSource from './AppShell.tsx?raw'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'

function sidebar(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar hidden={false} />
    </MemoryRouter>,
  )
}

describe('Sidebar health menu', () => {
  it('lists Health under Home and keeps the child collapsed', () => {
    const html = sidebar('/')
    const home = html.indexOf('>Home<')
    const health = html.indexOf('>Health<')
    const projects = html.indexOf('>Projects<')
    const settings = html.indexOf('>Settings<')

    expect(home).toBeGreaterThan(-1)
    expect(home).toBeLessThan(health)
    expect(health).toBeLessThan(projects)
    expect(projects).toBeLessThan(settings)
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('Protein Calculator')
    expect(html).toContain('nav-icon')
  })

  it('opens Protein Calculator as the selected child and titles the header', () => {
    const html = sidebar('/health/protein-calculator')
    const header = renderToStaticMarkup(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/health/protein-calculator']}>
          <Header menuOpen={false} showMenuButton={false} onMenuToggle={() => {}} />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('Protein Calculator')
    expect(html).toContain('href="/health/protein-calculator"')
    expect(html).toContain('aria-current="page"')
    expect(header).toContain('Protein Calculator')
  })

  it('keeps stroke icons, hover scale, and the narrow overlay', () => {
    const appCss = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
    expect(appCss).toContain('stroke: currentColor')
    expect(appCss).toContain('transform: scale(1.08)')
    expect(appCss).toContain('width: 1.25rem')
    expect(appCss).toContain('gap: 0.75rem')
    expect(appCss).not.toMatch(/icon-rail|64px/)
    expect(shellSource).toContain('max-width: 48rem')
    expect(shellSource).toContain('hidden={narrow && !sidebarOpen}')
    expect(mainSource).toContain('BrowserRouter')
    expect(mainSource).not.toContain('HashRouter')
  })
})
