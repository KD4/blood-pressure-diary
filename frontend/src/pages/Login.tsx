import { css } from '@emotion/react';
import { useState } from 'react';
import { CTAButton } from '@toss/tds-mobile';
import { appLogin } from '@apps-in-toss/web-framework';
import { oauthLogin } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useExitConfirm } from '../hooks/useExitConfirm';
import { useBackEvent } from '../hooks/useBackEvent';
import { color, fontSize, spacing } from '../styles/tokens';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openExitDialog, ExitConfirmDialog } = useExitConfirm();
  useBackEvent(openExitDialog);

  const handleTossLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { authorizationCode, referrer } = await appLogin();
      const { token, isNewUser } = await oauthLogin('toss', authorizationCode, referrer);
      login(token, isNewUser);
      navigate(isNewUser ? '/onboarding' : '/record', { replace: true });
    } catch (err) {
      console.error('토스 로그인 실패:', err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div css={containerStyle}>
      <ExitConfirmDialog />
      <div css={logoCardStyle}>
        <div css={heartIconStyle}>❤️</div>
        <h1 css={titleStyle}>혈압다이어리</h1>
        <p css={descStyle}>
          매일 혈압을 기록하고{'\n'}
          건강 변화를 한눈에 확인하세요
        </p>
      </div>

      {error && <p css={errorStyle}>{error}</p>}

      <div css={buttonAreaStyle}>
        {/* @ts-expect-error CTAButton children type mismatch with framer-motion */}
        <CTAButton onClick={handleTossLogin} loading={loading}>
          토스로 시작하기
        </CTAButton>
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
  background: ${color.bgPage};
`;

const logoCardStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.md}px;
  margin-bottom: 60px;
  width: 100%;
  max-width: 320px;
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

const errorStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.danger};
  text-align: center;
  margin-bottom: ${spacing.md}px;
`;

const buttonAreaStyle = css`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: ${spacing.md}px;
`;

