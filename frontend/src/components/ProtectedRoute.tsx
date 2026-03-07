import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { token, isGuest, isNewUser } = useAuth();

  // 미인증 + 비게스트 -> 로그인
  if (!token && !isGuest) return <Navigate to="/login" replace />;

  // 토스 로그인했지만 신규 사용자 -> 온보딩
  if (token && isNewUser) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}