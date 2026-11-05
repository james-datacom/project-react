import { Navigate, Route, Routes } from 'react-router'
import { musicPath, musicSearchPath } from './music/paths.ts'
import { AccountPage } from './pages/AccountPage.tsx'
import { EmptyDestinationPage } from './pages/EmptyDestinationPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { MusicPage } from './pages/MusicPage.tsx'
import { MusicSearchPage } from './pages/MusicSearchPage.tsx'
import { ProteinCalculatorPage } from './pages/ProteinCalculatorPage.tsx'
import { AppShell } from './shell/AppShell.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<EmptyDestinationPage />} />
        <Route path="settings" element={<EmptyDestinationPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="health/protein-calculator" element={<ProteinCalculatorPage />} />
        <Route path={musicPath.slice(1)} element={<MusicPage />} />
        <Route path={musicSearchPath.slice(1)} element={<MusicSearchPage />} />
        <Route path={`${musicPath.slice(1)}/:playlistId`} element={<MusicPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
