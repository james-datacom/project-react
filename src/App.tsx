import { Navigate, Route, Routes } from 'react-router'
import { AccountPage } from './pages/AccountPage.tsx'
import { EmptyDestinationPage } from './pages/EmptyDestinationPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { AppShell } from './shell/AppShell.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<EmptyDestinationPage />} />
        <Route path="settings" element={<EmptyDestinationPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
