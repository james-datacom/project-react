import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { applyTheme, resolveTheme } from './theme/theme.ts'
import { ThemeProvider } from './theme/ThemeProvider.tsx'
import './index.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

applyTheme(resolveTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

