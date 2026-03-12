import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { token, isNewUser } = useAuth();

  // 미인증 -> 로그인
  if (!token) return <Navigate to="/login" replace />;

  // 신규 사용자 -> 온보딩
  if (isNewUser) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}