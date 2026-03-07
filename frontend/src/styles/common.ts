import { css } from '@emotion/react';
import { color, spacing, radius, layout, fontSize } from './tokens';

export const pageStyle = css`
  max-width: 480px;
  margin: 0 auto;
  padding: ${spacing.xl}px ${layout.pagePaddingH}px ${spacing.xxl}px;
`;

export const cardStyle = css`
  background: ${color.bgCard};
  border-radius: ${radius.card}px;
  overflow: hidden;
`;

export const centerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

export const formSectionStyle = css`
  margin-bottom: ${spacing.section}px;
`;

export const darkCardStyle = css`
  background: ${color.bgCardDark};
  border-radius: ${radius.card}px;
  padding: ${spacing.xl}px;
  color: ${color.textOnDark};
`;

export const underlineInputStyle = css`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: ${color.textOnDark};
  font-size: ${fontSize.number}px;
  font-weight: 700;
  padding: ${spacing.sm}px 0;
  outline: none;
  text-align: center;
  &:focus {
    border-bottom-color: ${color.primary};
  }
  &::placeholder {
    color: ${color.placeholderOnDark};
    font-weight: 400;
  }
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;
