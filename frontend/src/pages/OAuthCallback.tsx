import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { oauthLogin } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { centerStyle } from '../styles/common';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const code = params.get('code');
    const referrer = params.get('referrer');

    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    oauthLogin('toss', code, referrer ?? undefined)
      .then(({ token, isNewUser }) => {
        login(token, isNewUser);
        navigate(isNewUser ? '/onboarding' : '/home', { replace: true });
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [params, navigate, login]);

  return (
    <div css={centerStyle}>
      <p>로그인 처리 중...</p>
    </div>
  );
}