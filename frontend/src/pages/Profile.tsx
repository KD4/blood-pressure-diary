import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch, useBottomSheet, BottomSheet, Dialog, useDialog } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import { useAuth } from '../contexts/AuthContext';
import { getNotificationSetting, updateNotificationSetting } from '../api/user';
import { withdraw } from '../api/auth';
import type { NotificationSetting } from '../types';
import { pageStyle } from '../styles/common';
import { color, fontSize, spacing, radius, layout } from '../styles/tokens';

// 아침 알림: 4시~14시
const MORNING_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  name: `${i + 4}시`,
  value: String(i + 4),
}));

// 저녁 알림: 16시~24시
const EVENING_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  name: i + 16 === 24 ? '24(자정)시' : `${i + 16}시`,
  value: String(i + 16),
}));

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { open, close } = useBottomSheet();
  const [notification, setNotification] = useState<NotificationSetting>({
    enabled: false,
    morningHour: 7,
    eveningHour: 21,
  });

  useEffect(() => {
    getNotificationSetting()
      .then(setNotification)
      .catch(console.error);
  }, []);

  const handleToggleNotification = async (_event: React.ChangeEvent<HTMLInputElement>, enabled: boolean) => {
    const updated = { ...notification, enabled };
    setNotification(updated);
    try {
      await updateNotificationSetting(updated);
    } catch (error) {
      console.error('알림 설정 변경 실패:', error);
      setNotification(prev => ({ ...prev, enabled: !enabled }));
    }
  };

  const handleMorningHourChange = async (hour: number) => {
    const updated = { ...notification, morningHour: hour };
    setNotification(updated);
    try {
      await updateNotificationSetting(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEveningHourChange = async (hour: number) => {
    const updated = { ...notification, eveningHour: hour };
    setNotification(updated);
    try {
      await updateNotificationSetting(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const openMorningPicker = () => {
    open({
      header: '아침 알림 시각',
      children: (
        <BottomSheet.Select
          options={MORNING_OPTIONS}
          value={String(notification.morningHour ?? 7)}
          onChange={(e) => {
            handleMorningHourChange(Number(e.target.value));
            close();
          }}
        />
      ),
    });
  };

  const openEveningPicker = () => {
    open({
      header: '저녁 알림 시각',
      children: (
        <BottomSheet.Select
          options={EVENING_OPTIONS}
          value={String(notification.eveningHour ?? 21)}
          onChange={(e) => {
            handleEveningHourChange(Number(e.target.value));
            close();
          }}
        />
      ),
    });
  };

  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const handleWithdraw = async () => {
    try {
      await withdraw();
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const morningLabel = `${notification.morningHour ?? 7}시`;
  const eveningLabel = notification.eveningHour === 24
    ? '24(자정)시'
    : `${notification.eveningHour ?? 21}시`;

  return (
    <div css={pageStyle}>
      <h1 css={headingStyle}>설정</h1>

      {/* 측정 알림 */}
      <div css={sectionCardStyle}>
        <h3 css={sectionTitleStyle}>측정 알림</h3>
        <div css={settingRowStyle}>
          <span css={settingLabelStyle}>측정 알림 받기</span>
          <Switch
            checked={notification.enabled}
            onChange={handleToggleNotification}
          />
        </div>

        {notification.enabled && (
          <>
            <div css={settingRowStyle}>
              <span css={settingLabelStyle}>아침 알림 시각</span>
              <button css={timePickerButtonStyle} onClick={openMorningPicker}>
                {morningLabel}
                <span css={timePickerArrowStyle}>▼</span>
              </button>
            </div>

            <div css={settingRowStyle}>
              <span css={settingLabelStyle}>저녁 알림 시각</span>
              <button css={timePickerButtonStyle} onClick={openEveningPicker}>
                {eveningLabel}
                <span css={timePickerArrowStyle}>▼</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 단위 */}
      <div css={sectionCardStyle}>
        <h3 css={sectionTitleStyle}>단위</h3>
        <div css={settingRowStyle}>
          <span css={settingLabelStyle}>혈압 단위</span>
          <span css={settingValueStyle}>mmHg</span>
        </div>
      </div>

      {/* 계정 */}
      <div css={sectionCardStyle}>
        <h3 css={sectionTitleStyle}>계정</h3>
        <button css={withdrawButtonStyle} onClick={() => setWithdrawDialogOpen(true)}>
          회원탈퇴
        </button>
      </div>

      <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)}>
        <Dialog.Header>회원탈퇴</Dialog.Header>
        <Dialog.Body>
          탈퇴 시 모든 혈압 기록, 약물 정보 등 저장된 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close>취소</Dialog.Close>
          <Dialog.Action onClick={handleWithdraw} variant="danger">탈퇴하기</Dialog.Action>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

const headingStyle = css`
  font-size: ${fontSize.title}px;
  font-weight: 700;
  color: ${color.text};
  margin-bottom: ${spacing.lg}px;
`;

const sectionCardStyle = css`
  background: ${color.bgCard};
  border-radius: ${radius.card}px;
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

const timePickerButtonStyle = css`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.medium}px;
  font-size: ${fontSize.body}px;
  background: ${color.bgCard};
  color: ${adaptive.grey900};
  cursor: pointer;
  min-height: 40px;
`;

const timePickerArrowStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondary};
`;

const withdrawButtonStyle = css`
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
