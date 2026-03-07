import { css } from '@emotion/react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useExitConfirm } from '../hooks/useExitConfirm';
import { useTossBanner } from '../hooks/useTossBanner';
import { layout } from '../styles/tokens';

export default function MainLayout() {
  const { exitDialog } = useExitConfirm();

  useTossBanner(import.meta.env.VITE_AD_BANNER_ID);

  return (
    <div css={containerStyle}>
      <Outlet />
      <BottomNav />
      {exitDialog}
    </div>
  );
}

const containerStyle = css`
  padding-bottom: ${layout.navHeight + 60}px;
`;