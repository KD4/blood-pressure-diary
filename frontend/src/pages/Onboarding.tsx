import { css } from '@emotion/react';
import { Button } from '@toss/tds-mobile';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { color, fontSize, spacing } from '../styles/tokens';
import { pageStyle } from '../styles/common';

export default function Onboarding() {
  const { isGuest, loginAsGuest, isNewUser } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (isNewUser) {
      localStorage.setItem('isNewUser', 'false');
    }
    navigate('/home', { replace: true });
  };

  const handleGuestStart = () => {
    loginAsGuest();
    navigate('/home', { replace: true });
  };

  return (
    <div css={[pageStyle, containerStyle]}>
      <div css={contentStyle}>
        <div css={stepStyle}>
          <div css={stepIconStyle}>📋</div>
          <h2 css={stepTitleStyle}>혈압을 기록하세요</h2>
          <p css={stepDescStyle}>수축기, 이완기, 맥박 숫자만 입력하면 끝!</p>
        </div>

        <div css={stepStyle}>
          <div css={stepIconStyle}>📈</div>
          <h2 css={stepTitleStyle}>추이를 확인하세요</h2>
          <p css={stepDescStyle}>그래프로 혈압 변화를 한눈에 볼 수 있어요</p>
        </div>

        <div css={stepStyle}>
          <div css={stepIconStyle}>🔔</div>
          <h2 css={stepTitleStyle}>알림을 받으세요</h2>
          <p css={stepDescStyle}>아침, 저녁 측정 시간에 알림을 보내드려요</p>
        </div>
      </div>

      <div css={buttonAreaStyle}>
        <Button.Primary size="large" onClick={handleStart}>
          시작하기
        </Button.Primary>
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