import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import OAuthCallback from './pages/OAuthCallback'
import Onboarding from './pages/Onboarding'
import Record from './pages/Record'
import Statistics from './pages/Statistics'
import History from './pages/History'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/toss/callback" element={<OAuthCallback />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/record" element={<Record />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/record" replace />} />
    </Routes>
  )
}
