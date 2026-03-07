import { css } from '@emotion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { color, layout, fontSize } from '../styles/tokens';

const navItems = [
  { path: '/home', label: '홈', icon: '🏠' },
  { path: '/record', label: '기록', icon: '✏️' },
  { path: '/statistics', label: '통계', icon: '📊' },
  { path: '/profile', label: '설정', icon: '⚙️' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav css={navStyle}>
      {navItems.map(item => (
        <button
          key={item.path}
          css={[navItemStyle, pathname === item.path && activeStyle]}
          onClick={() => navigate(item.path)}
        >
          <span css={iconStyle}>{item.icon}</span>
          <span css={labelStyle}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

const navStyle = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${layout.navHeight}px;
  background: ${color.bgCard};
  border-top: 1px solid ${color.border};
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
`;

const navItemStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  min-width: ${layout.minTouchTarget}px;
  min-height: ${layout.minTouchTarget}px;
  color: ${color.textTertiary};
`;

const activeStyle = css`
  color: ${color.primary};
`;

const iconStyle = css`
  font-size: 20px;
`;

const labelStyle = css`
  font-size: ${fontSize.caption}px;
`;