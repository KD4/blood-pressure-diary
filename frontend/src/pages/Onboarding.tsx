import { css } from '@emotion/react';
import { CTAButton } from '@toss/tds-mobile';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useExitConfirm } from '../hooks/useExitConfirm';
import { useBackEvent } from '../hooks/useBackEvent';
import { color, fontSize, spacing } from '../styles/tokens';
import { pageStyle } from '../styles/common';

export default function Onboarding() {
  const { isGuest, loginAsGuest, isNewUser } = useAuth();
  const navigate = useNavigate();
  const { openExitDialog, ExitConfirmDialog } = useExitConfirm();
  useBackEvent(openExitDialog);

  const handleStart = () => {
    if (isNewUser) {
      localStorage.setItem('isNewUser', 'false');
    }
    navigate('/record', { replace: true });
  };

  const handleGuestStart = () => {
    loginAsGuest();
    navigate('/record', { replace: true });
  };

  return (
    <div css={[pageStyle, containerStyle]}>
      <ExitConfirmDialog />
      <div css={contentStyle}>
        <div css={stepStyle}>
          <div css={stepIconStyle}>📋</div>
          <h2 css={stepTitleStyle}>혈압을 기록하세요</h2>
          <p css={stepDescStyle}>수축기, 이완기, 맥박 숫자만 입력하면 끝!</p>
        </div>

        <div css={stepStyle}>
          <div css={stepIconStyle}>📈</div>
          <h2 css={stepTitleStyle}>변화를 확인하세요</h2>
          <p css={stepDescStyle}>그래프로 혈압 변화를 한눈에 볼 수 있어요</p>
        </div>

        <div css={stepStyle}>
          <div css={stepIconStyle}>🔔</div>
          <h2 css={stepTitleStyle}>알림을 받으세요</h2>
          <p css={stepDescStyle}>아침, 저녁 측정 시간에 알림을 보내드려요</p>
        </div>
      </div>

      <div css={buttonAreaStyle}>
        {/* @ts-expect-error CTAButton children type mismatch with framer-motion */}
        <CTAButton onClick={handleStart}>
          시작하기
        </CTAButton>
        {!isGuest && (
          <button css={guestButtonStyle} onClick={handleGuestStart}>
            로그인 없이 둘러보기
          </button>
        )}
      </div>
    </div>
  );
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100dvh;
`;

const contentStyle = css`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xxl * 2}px;
  margin-bottom: 60px;
`;

const stepStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm}px;
`;

const stepIconStyle = css`
  font-size: 48px;
`;

const stepTitleStyle = css`
  font-size: ${fontSize.heading}px;
  font-weight: 700;
  color: ${color.text};
`;

const stepDescStyle = css`
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
  text-align: center;
`;

const buttonAreaStyle = css`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md}px;
`;

const guestButtonStyle = css`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
  padding: ${spacing.md}px;
  text-align: center;
`;

