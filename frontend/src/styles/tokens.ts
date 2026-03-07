import { adaptive } from '@toss/tds-colors';

export const color = {
  bgPage: adaptive.grey50,
  bgCard: adaptive.background,
  primary: '#27AE60',
  primaryLight: adaptive.green50,
  danger: '#C0392B',
  dangerLight: adaptive.red50,
  warning: '#F39C12',
  warningLight: adaptive.orange50,
  caution: '#E67E22',
  success: '#27AE60',
  successLight: adaptive.green50,
  border: adaptive.grey200,
  text: adaptive.grey900,
  textSecondary: adaptive.grey600,
  textTertiary: adaptive.grey500,
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
  navHeight: 60,
  minTouchTarget: 56,  // 4060 타겟: 최소 56dp
} as const;

// 4060 타겟 폰트 크기 (sp 기준)
export const fontSize = {
  body: 17,           // 본문 최소 17sp
  number: 24,         // 숫자 최소 24sp
  numberLarge: 32,    // 큰 숫자
  label: 14,
  caption: 12,
  heading: 20,
  title: 24,
} as const;