import { css } from '@emotion/react';
import { Button } from '@toss/tds-mobile';
import { appLogin } from '@apps-in-toss/web-framework';
import { oauthLogin } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { color, fontSize, spacing } from '../styles/tokens';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTossLogin = async () => {
    try {
      const { authorizationCode, referrer } = await appLogin();
      const { token, isNewUser } = await oauthLogin('toss', authorizationCode, referrer);
      login(token, isNewUser);
      navigate(isNewUser ? '/onboarding' : '/home', { replace: true });
    } catch (error) {
      console.error('토스 로그인 실패:', error);
    }
  };

  return (
    <div css={containerStyle}>
      <div css={logoAreaStyle}>
        <div css={heartIconStyle}>❤️</div>
        <h1 css={titleStyle}>혈압다이어리</h1>
        <p css={descStyle}>
          매일 혈압을 기록하고{'\n'}
          건강 추이를 한눈에 확인하세요
        </p>
      </div>

      <div css={buttonAreaStyle}>
        <Button.Primary size="large" onClick={handleTossLogin}>
          토스로 시작하기
        </Button.Primary>
      </div>
    </div>
  );
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 20px;
`;

const logoAreaStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.md}px;
  margin-bottom: 60px;
`;

const heartIconStyle = css`
  font-size: 64px;
`;

const titleStyle = css`
  font-size: ${fontSize.title}px;
  font-weight: 700;
  color: ${color.text};
`;

const descStyle = css`
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
  text-align: center;
  white-space: pre-line;
  line-height: 1.6;
`;

const buttonAreaStyle = css`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: ${spacing.md}px;
`;