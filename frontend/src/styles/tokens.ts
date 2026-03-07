import { adaptive } from '@toss/tds-colors';

export const color = {
  // TDS adaptive 기본
  bgPage: adaptive.grey50,
  bgCard: adaptive.background,
  primary: adaptive.blue500,
  primaryLight: adaptive.blue50,
  danger: adaptive.red500,
  dangerLight: adaptive.red50,
  warning: adaptive.orange500,
  warningLight: adaptive.orange50,
  caution: adaptive.orange600,
  success: adaptive.green500,
  successLight: adaptive.green50,
  border: adaptive.grey200,
  text: adaptive.grey900,
  textSecondary: adaptive.grey600,
  textTertiary: adaptive.grey400,
  // 그라디언트 배경
  bgGradientStart: '#1a3a5c',
  bgGradientEnd: '#87CEEB',
  // 다크 카드
  bgCardDark: '#1E2A3A',
  textOnDark: '#FFFFFF',
  textSecondaryOnDark: 'rgba(255, 255, 255, 0.6)',
  placeholderOnDark: 'rgba(255, 255, 255, 0.3)',
  // 네비게이션
  bgNav: adaptive.grey900,
} as const;

// 혈압 레벨 색상 (의료 표준 색상이므로 TDS 색상과 별도 관리)
export const bpColor = {
  normal: adaptive.green500,
  elevated: adaptive.orange400,
  high1: adaptive.orange600,
  high2: adaptive.red500,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 24,
} as const;

export const radius = {
  small: 6,
  medium: 8,
  large: 12,
  card: 20,
  pill: 20,
} as const;

export const layout = {
  pagePaddingH: 20,
  navHeight: 76,
  minTouchTarget: 56,
} as const;

// 어르신 친화 폰트 크기
export const fontSize = {
  body: 20,
  number: 32,
  numberLarge: 40,
  label: 17,
  caption: 15,
  heading: 24,
  title: 28,
} as const;
