import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import { getTodaySummary } from '../api/bp';
import { useDataCache } from '../contexts/DataCacheContext';
import { BP_LEVEL_CONFIG } from '../types';
import type { TodaySummaryResponse } from '../types';
import { pageStyle, cardStyle } from '../styles/common';
import { color, fontSize, spacing, radius } from '../styles/tokens';

export default function Home() {
  const navigate = useNavigate();
  const cache = useDataCache();
  const [summary, setSummary] = useState<TodaySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = cache.get<TodaySummaryResponse>('todaySummary');
    if (cached) {
      setSummary(cached);
      setLoading(false);
      return;
    }

    getTodaySummary()
      .then(data => {
        setSummary(data);
        cache.set('todaySummary', data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cache]);

  if (loading) {
    return <div css={[pageStyle, loadingStyle]}>불러오는 중...</div>;
  }

  const latest = summary?.latestRecord;
  const levelConfig = latest ? BP_LEVEL_CONFIG[latest.level] : null;

  return (
    <div css={pageStyle}>
      <h1 css={headingStyle}>혈압다이어리</h1>

      {/* 오늘 측정값 요약 카드 */}
      <div css={[cardStyle, summaryCardStyle]}>
        {latest ? (
          <>
            <div css={bpValueRowStyle}>
              <div css={bpValueStyle}>
                <span css={bpNumberStyle}>{latest.systolic}</span>
                <span css={bpUnitStyle}>수축기</span>
              </div>
              <span css={bpSeparatorStyle}>/</span>
              <div css={bpValueStyle}>
                <span css={bpNumberStyle}>{latest.diastolic}</span>
                <span css={bpUnitStyle}>이완기</span>
              </div>
              <div css={bpValueStyle}>
                <span css={[bpNumberStyle, pulseNumberStyle]}>{latest.pulse}</span>
                <span css={bpUnitStyle}>맥박</span>
              </div>
            </div>
            {levelConfig && (
              <div css={levelBadgeStyle(levelConfig.color)}>
                {levelConfig.label} - {levelConfig.message}
              </div>
            )}
            <p css={recordCountStyle}>
              오늘 {summary?.todayRecordCount ?? 0}회 측정
            </p>
          </>
        ) : (
          <div css={emptyCardStyle}>
            <p css={emptyTextStyle}>오늘 아직 측정 기록이 없어요</p>
            <p css={emptySubTextStyle}>지금 혈압을 측정하고 기록해보세요</p>
          </div>
        )}
      </div>

      {/* 기록하기 CTA */}
      <div css={ctaStyle}>
        <Button.Primary size="large" onClick={() => navigate('/record')}>
          지금 기록하기
        </Button.Primary>
      </div>

      {/* 최근 7일 미니 그래프 */}
      {summary && summary.weekRecords.length > 0 && (
        <div css={[cardStyle, weekCardStyle]}>
          <h3 css={sectionTitleStyle}>최근 7일</h3>
          <div css={miniChartStyle}>
            {summary.weekRecords.slice(0, 14).reverse().map((record, i) => {
              const height = Math.max(20, Math.min(100, (record.systolic - 80) * 1.2));
              const barColor = BP_LEVEL_CONFIG[record.level].color;
              return (
                <div key={i} css={barContainerStyle}>
                  <div css={barStyle(height, barColor)} />
                  <span css={barLabelStyle}>{record.systolic}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const headingStyle = css`
  font-size: ${fontSize.title}px;
  font-weight: 700;
  color: ${color.text};
  margin: ${spacing.xl}px 0 ${spacing.lg}px;
`;

const loadingStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
`;

const summaryCardStyle = css`
  padding: ${spacing.xxl}px;
  margin-bottom: ${spacing.lg}px;
`;

const bpValueRowStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.lg}px;
  margin-bottom: ${spacing.lg}px;
`;

const bpValueStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const bpNumberStyle = css`
  font-size: ${fontSize.numberLarge}px;
  font-weight: 700;
  color: ${color.text};
`;

const pulseNumberStyle = css`
  font-size: ${fontSize.number}px;
`;

const bpUnitStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondary};
`;

const bpSeparatorStyle = css`
  font-size: ${fontSize.number}px;
  color: ${color.textTertiary};
  margin-top: -${spacing.lg}px;
`;

const levelBadgeStyle = (bgColor: string) => css`
  display: inline-block;
  padding: ${spacing.sm}px ${spacing.lg}px;
  background: ${bgColor}20;
  color: ${bgColor};
  border-radius: ${radius.pill}px;
  font-size: ${fontSize.body}px;
  font-weight: 600;
  text-align: center;
  width: 100%;
`;

const recordCountStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondary};
  text-align: center;
  margin-top: ${spacing.md}px;
`;

const emptyCardStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm}px;
  padding: ${spacing.xl}px 0;
`;

const emptyTextStyle = css`
  font-size: ${fontSize.body}px;
  color: ${color.text};
  font-weight: 600;
`;

const emptySubTextStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondary};
`;

const ctaStyle = css`
  margin-bottom: ${spacing.xxl}px;
`;

const weekCardStyle = css`
  padding: ${spacing.xl}px;
`;

const sectionTitleStyle = css`
  font-size: ${fontSize.body}px;
  font-weight: 600;
  color: ${color.text};
  margin-bottom: ${spacing.lg}px;
`;

const miniChartStyle = css`
  display: flex;
  align-items: flex-end;
  gap: ${spacing.xs}px;
  height: 120px;
  overflow-x: auto;
`;

const barContainerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 20px;
`;

const barStyle = (height: number, barColor: string) => css`
  width: 100%;
  height: ${height}px;
  background: ${barColor};
  border-radius: 4px 4px 0 0;
`;

const barLabelStyle = css`
  font-size: 10px;
  color: ${color.textTertiary};
`;