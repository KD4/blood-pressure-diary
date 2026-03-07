import { Outlet } from 'react-router-dom';
import { css } from '@emotion/react';
import { adaptive } from '@toss/tds-colors';
import BottomNav from '../components/BottomNav';
import { useExitConfirm } from '../hooks/useExitConfirm';
import { layout } from '../styles/tokens';

export default function MainLayout() {
  const { exitDialog } = useExitConfirm();

  return (
    <div css={appLayoutStyle}>
      <main css={appMainStyle}>
        <Outlet />
      </main>
      <BottomNav />
      {exitDialog}
    </div>
  );
}

const appLayoutStyle = css`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${adaptive.grey50};
`;

const appMainStyle = css`
  flex: 1;
  padding-bottom: ${layout.navHeight}px;
`;
