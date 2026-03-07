import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toggle } from '@toss/tds-mobile';
import { useAuth } from '../contexts/AuthContext';
import { getNotificationSetting, updateNotificationSetting } from '../api/user';
import type { NotificationSetting } from '../types';
import { pageStyle, cardStyle } from '../styles/common';
import { color, fontSize, spacing, radius, layout } from '../styles/tokens';

export default function Profile() {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<NotificationSetting>({
    enabled: false,
    morningHour: 7,
    eveningHour: 21,
  });

  useEffect(() => {
    if (isGuest) return;
    getNotificationSetting()
      .then(setNotification)
      .catch(console.error);
  }, [isGuest]);

  const handleToggleNotification = async (enabled: boolean) => {
    const updated = { ...notification, enabled };
    setNotification(updated);
    if (!isGuest) {
      try {
        await updateNotificationSetting(updated);
      } catch (error) {
        console.error('알림 설정 변경 실패:', error);
        setNotification(prev => ({ ...prev, enabled: !enabled }));
      }
    }
  };

  const handleMorningHourChange = async (hour: number) => {
    const updated = { ...notification, morningHour: hour };
    setNotification(updated);
    if (!isGuest) {
      try {
        await updateNotificationSetting(updated);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEveningHourChange = async (hour: number) => {
    const updated = { ...notification, eveningHour: hour };
    setNotification(updated);
    if (!isGuest) {
      try {
        await updateNotificationSetting(updated);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div css={pageStyle}>
      <h1 css={headingStyle}>설정</h1>

      {/* 측정 알림 */}
      <div css={[cardStyle, sectionStyle]}>
        <h3 css={sectionTitleStyle}>측정 알림</h3>
        <div css={settingRowStyle}>
          <span css={settingLabelStyle}>측정 알림 받기</span>
          <Toggle
            checked={notification.enabled}
            onChange={handleToggleNotification}
          />
        </div>

        {notification.enabled && (
          <>
            <div css={settingRowStyle}>
              <span css={settingLabelStyle}>아침 알림 시각</span>
              <select
                css={selectStyle}
                value={notification.morningHour ?? 7}
                onChange={e => handleMorningHourChange(Number(e.target.value))}
              >
                {Array.from({ length: 8 }, (_, i) => i + 5).map(h => (
                  <option key={h} value={h}>{h}시</option>
                ))}
              </select>
            </div>

            <div css={settingRowStyle}>
              <span css={settingLabelStyle}>저녁 알림 시각</span>
              <select
                css={selectStyle}
                value={notification.eveningHour ?? 21}
                onChange={e => handleEveningHourChange(Number(e.target.value))}
              >
                {Array.from({ length: 8 }, (_, i) => i + 17).map(h => (
                  <option key={h} value={h}>{h}시</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* 단위 */}
      <div css={[cardStyle, sectionStyle]}>
        <h3 css={sectionTitleStyle}>단위</h3>
        <div css={settingRowStyle}>
          <span css={settingLabelStyle}>혈압 단위</span>
          <span css={settingValueStyle}>mmHg</span>
        </div>
      </div>

      {/* 계정 */}
      <div css={[cardStyle, sectionStyle]}>
        <h3 css={sectionTitleStyle}>계정</h3>
        {isGuest && (
          <p css={guestNoticeStyle}>
            게스트 모드입니다. 토스 로그인하면 데이터를 안전하게 보관할 수 있어요.
          </p>
        )}
        <button css={logoutButtonStyle} onClick={handleLogout}>
          {isGuest ? '게스트 모드 종료' : '로그아웃'}
        </button>
      </div>
    </div>
  );
}

const headingStyle = css`
  font-size: ${fontSize.title}px;
  font-weight: 700;
  color: ${color.text};
  margin: ${spacing.xl}px 0 ${spacing.lg}px;
`;

const sectionStyle = css`
  padding: ${spacing.xl}px;
  margin-bottom: ${spacing.lg}px;
`;

const sectionTitleStyle = css`
  font-size: ${fontSize.body}px;
  font-weight: 600;
  color: ${color.text};
  margin-bottom: ${spacing.lg}px;
`;

const settingRowStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md}px 0;
  min-height: ${layout.minTouchTarget}px;
  &:not(:last-child) {
    border-bottom: 1px solid ${color.border};
  }
`;

const settingLabelStyle = css`
  font-size: ${fontSize.body}px;
  color: ${color.text};
`;

const settingValueStyle = css`
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
`;

const selectStyle = css`
  padding: ${spacing.sm}px ${spacing.md}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.medium}px;
  font-size: ${fontSize.body}px;
  background: ${color.bgCard};
  color: ${color.text};
  min-height: 40px;
`;

const guestNoticeStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.warning};
  background: ${color.warningLight};
  padding: ${spacing.md}px;
  border-radius: ${radius.medium}px;
  margin-bottom: ${spacing.md}px;
`;

const logoutButtonStyle = css`
  width: 100%;
  padding: ${spacing.lg}px;
  border: 1px solid ${color.danger};
  border-radius: ${radius.medium}px;
  background: transparent;
  color: ${color.danger};
  font-size: ${fontSize.body}px;
  cursor: pointer;
  min-height: ${layout.minTouchTarget}px;
`;