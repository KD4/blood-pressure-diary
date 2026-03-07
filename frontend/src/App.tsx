import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import OAuthCallback from './pages/OAuthCallback'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Record from './pages/Record'
import Statistics from './pages/Statistics'
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
          <Route path="/home" element={<Home />} />
          <Route path="/record" element={<Record />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}