import { css } from '@emotion/react';
import { useState } from 'react';
import { BP_LEVEL_CONFIG } from '../types';
import type { BpLevel } from '../types';
import { color, spacing, fontSize, radius } from '../styles/tokens';

const LEVELS: BpLevel[] = ['LOW', 'NORMAL', 'ELEVATED', 'HIGH_1', 'HIGH_2'];

const SHORT_LABELS: Record<BpLevel, string> = {
  LOW: '저혈압',
  NORMAL: '정상',
  ELEVATED: '주의',
  HIGH_1: '고혈압1',
  HIGH_2: '고혈압2',
};

const BP_CRITERIA: Record<BpLevel, { systolic: string; diastolic: string; desc: string }> = {
  LOW:      { systolic: '< 90',      diastolic: '< 60',      desc: '어지러움, 실신 위험. 증상 시 병원 방문' },
  NORMAL:   { systolic: '90 ~ 119',  diastolic: '60 ~ 79',   desc: '건강한 혈압. 현재 생활습관 유지' },
  ELEVATED: { systolic: '120 ~ 139', diastolic: '80 ~ 89',   desc: '생활습관 개선 필요 (식이, 운동)' },
  HIGH_1:   { systolic: '140 ~ 159', diastolic: '90 ~ 99',   desc: '의사 상담 및 약물 치료 고려' },
  HIGH_2:   { systolic: '>= 160',    diastolic: '>= 100',    desc: '즉시 병원 방문 권고' },
};

export default function BpLevelLegend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div css={wrapperStyle}>
      <div css={dotsRowStyle}>
        {LEVELS.map(level => {
          const config = BP_LEVEL_CONFIG[level];
          return (
            <div key={level} css={itemStyle}>
              <span css={dotStyle(config.color)} />
              <span css={labelStyle}>{SHORT_LABELS[level]}</span>
            </div>
          );
        })}
      </div>
      <button css={toggleBtnStyle} onClick={() => setExpanded(!expanded)}>
        {expanded ? '기준표 닫기' : '기준표 보기'}
      </button>

      {expanded && (
        <div css={tableWrapperStyle}>
          <p css={sourceStyle}>WHO/ISH 혈압 분류 기준 (수축기 또는 이완기 중 높은 등급 적용)</p>
          <div css={tableStyle}>
            <div css={tableHeaderStyle}>
              <span css={thCellStyle} />
              <span css={thCellStyle}>수축기</span>
              <span css={thCellStyle}>이완기</span>
            </div>
            {LEVELS.map(level => {
              const config = BP_LEVEL_CONFIG[level];
              const criteria = BP_CRITERIA[level];
              return (
                <div key={level}>
                  <div css={tableRowStyle}>
                    <span css={tdLabelStyle}>
                      <span css={dotSmallStyle(config.color)} />
                      {config.label}
                    </span>
                    <span css={tdValueStyle}>{criteria.systolic}</span>
                    <span css={tdValueStyle}>{criteria.diastolic}</span>
                  </div>
                  <p css={descStyle}>{criteria.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const wrapperStyle = css`
  margin-bottom: ${spacing.md}px;
`;

const dotsRowStyle = css`
  display: flex;
  gap: ${spacing.sm}px;
  justify-content: center;
  padding: ${spacing.sm}px 0;
`;

const itemStyle = css`
  display: flex;
  align-items: center;
  gap: ${spacing.xs}px;
`;

const dotStyle = (c: string) => css`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${c};
`;

const dotSmallStyle = (c: string) => css`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${c};
  margin-right: ${spacing.xs}px;
  flex-shrink: 0;
`;

const labelStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondary};
`;

const toggleBtnStyle = css`
  display: block;
  margin: ${spacing.xs}px auto 0;
  background: none;
  border: none;
  font-size: 13px;
  color: ${color.primary};
  cursor: pointer;
  padding: ${spacing.xs}px ${spacing.md}px;
`;

const tableWrapperStyle = css`
  background: ${color.bgCard};
  border-radius: ${radius.card}px;
  padding: ${spacing.lg}px;
  margin-top: ${spacing.sm}px;
`;

const sourceStyle = css`
  font-size: 12px;
  color: ${color.textTertiary};
  margin-bottom: ${spacing.md}px;
  line-height: 1.4;
`;

const tableStyle = css`
  display: flex;
  flex-direction: column;
`;

const tableHeaderStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${spacing.xs}px;
  padding-bottom: ${spacing.sm}px;
  border-bottom: 1px solid ${color.border};
`;

const thCellStyle = css`
  font-size: 13px;
  font-weight: 600;
  color: ${color.textSecondary};
  text-align: center;
  &:first-of-type {
    text-align: left;
  }
`;

const tableRowStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${spacing.xs}px;
  padding: ${spacing.sm}px 0 2px;
`;

const tdLabelStyle = css`
  font-size: ${fontSize.caption}px;
  font-weight: 600;
  color: ${color.text};
  display: flex;
  align-items: center;
`;

const tdValueStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.text};
  text-align: center;
`;

const descStyle = css`
  font-size: 12px;
  color: ${color.textTertiary};
  padding-bottom: ${spacing.sm}px;
  border-bottom: 1px solid ${color.border};
  padding-left: 12px;
  line-height: 1.3;
`;
