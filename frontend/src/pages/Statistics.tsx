import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { getStats } from '../api/bp';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { BP_LEVEL_CONFIG } from '../types';
import type { StatsResponse } from '../types';
import { pageStyle, cardStyle } from '../styles/common';
import { color, fontSize, spacing, radius } from '../styles/tokens';

const PERIOD_OPTIONS = [
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '90일', value: 90 },
];

export default function Statistics() {
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAd } = useInterstitialAd(import.meta.env.VITE_AD_INTERSTITIAL_ID);

  useEffect(() => {
    setLoading(true);
    getStats(days)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const handleShare = async () => {
    await showAd();
    // TODO: 리포트 이미지 생성 및 공유
    alert('리포트 공유 기능은 추후 업데이트 예정입니다.');
  };

  return (
    <div css={pageStyle}>
      <h1 css={headingStyle}>통계</h1>

      {/* 기간 선택 */}
      <div css={periodSelectorStyle}>
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            css={[periodButtonStyle, days === opt.value && periodActiveStyle]}
            onClick={() => setDays(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p css={loadingTextStyle}>불러오는 중...</p>
      ) : !stats || stats.records.length === 0 ? (
        <div css={emptyStyle}>
          <p>해당 기간의 기록이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 평균/최고/최저 요약 */}
          <div css={[cardStyle, summaryCardStyle]}>
            <h3 css={sectionTitleStyle}>평균</h3>
            <div css={summaryRowStyle}>
              <div css={summaryItemStyle}>
                <span css={summaryLabelStyle}>수축기</span>
                <span css={summaryValueStyle}>{stats.avgSystolic.toFixed(0)}</span>
              </div>
              <div css={summaryItemStyle}>
                <span css={summaryLabelStyle}>이완기</span>
                <span css={summaryValueStyle}>{stats.avgDiastolic.toFixed(0)}</span>
              </div>
              <div css={summaryItemStyle}>
                <span css={summaryLabelStyle}>맥박</span>
                <span css={summaryValueStyle}>{stats.avgPulse.toFixed(0)}</span>
              </div>
            </div>

            <div css={rangeRowStyle}>
              <span css={rangeLabelStyle}>수축기 범위</span>
              <span css={rangeValueStyle}>{stats.minSystolic} ~ {stats.maxSystolic}</span>
            </div>
            <div css={rangeRowStyle}>
              <span css={rangeLabelStyle}>이완기 범위</span>
              <span css={rangeValueStyle}>{stats.minDiastolic} ~ {stats.maxDiastolic}</span>
            </div>
          </div>

          {/* 아침 vs 저녁 비교 */}
          {(stats.morningAvgSystolic != null || stats.eveningAvgSystolic != null) && (
            <div css={[cardStyle, comparisonCardStyle]}>
              <h3 css={sectionTitleStyle}>아침 vs 저녁</h3>
              <div css={comparisonRowStyle}>
                <div css={comparisonItemStyle}>
                  <span css={comparisonLabelStyle}>아침 평균</span>
                  <span css={comparisonValueStyle}>
                    {stats.morningAvgSystolic != null
                      ? `${stats.morningAvgSystolic.toFixed(0)}/${stats.morningAvgDiastolic?.toFixed(0)}`
                      : '-'}
                  </span>
                </div>
                <div css={comparisonItemStyle}>
                  <span css={comparisonLabelStyle}>저녁 평균</span>
                  <span css={comparisonValueStyle}>
                    {stats.eveningAvgSystolic != null
                      ? `${stats.eveningAvgSystolic.toFixed(0)}/${stats.eveningAvgDiastolic?.toFixed(0)}`
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 꺾은선 그래프 (간단 바 차트) */}
          <div css={[cardStyle, chartCardStyle]}>
            <h3 css={sectionTitleStyle}>혈압 추이</h3>
            <div css={chartStyle}>
              {stats.records.slice().reverse().map((record, i) => {
                const sysHeight = Math.max(10, Math.min(80, (record.systolic - 80) * 0.8));
                const diaHeight = Math.max(10, Math.min(60, (record.diastolic - 40) * 0.8));
                const levelColor = BP_LEVEL_CONFIG[record.level].color;
                return (
                  <div key={i} css={chartBarGroupStyle}>
                    <div css={chartBarStyle(sysHeight, levelColor)} title={`${record.systolic}`} />
                    <div css={chartBarStyle(diaHeight, `${levelColor}80`)} title={`${record.diastolic}`} />
                    <span css={chartDateStyle}>
                      {new Date(record.measuredAt).getDate()}일
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 리포트 공유 */}
          <button css={shareButtonStyle} onClick={handleShare}>
            리포트 공유하기
          </button>
        </>
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

const periodSelectorStyle = css`
  display: flex;
  gap: ${spacing.sm}px;
  margin-bottom: ${spacing.xl}px;
`;

const periodButtonStyle = css`
  flex: 1;
  padding: ${spacing.md}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.pill}px;
  background: ${color.bgCard};
  color: ${color.textSecondary};
  font-size: ${fontSize.body}px;
  cursor: pointer;
  min-height: 44px;
`;

const periodActiveStyle = css`
  background: ${color.primary};
  color: white;
  border-color: ${color.primary};
`;

const loadingTextStyle = css`
  text-align: center;
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
  padding: ${spacing.xxl}px;
`;

const emptyStyle = css`
  text-align: center;
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
  padding: ${spacing.xxl * 2}px;
`;

const summaryCardStyle = css`
  padding: ${spacing.xl}px;
  margin-bottom: ${spacing.lg}px;
`;

const sectionTitleStyle = css`
  font-size: ${fontSize.body}px;
  font-weight: 600;
  color: ${color.text};
  margin-bottom: ${spacing.lg}px;
`;

const summaryRowStyle = css`
  display: flex;
  justify-content: space-around;
  margin-bottom: ${spacing.lg}px;
`;

const summaryItemStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs}px;
`;

const summaryLabelStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondary};
`;

const summaryValueStyle = css`
  font-size: ${fontSize.number}px;
  font-weight: 700;
  color: ${color.text};
`;

const rangeRowStyle = css`
  display: flex;
  justify-content: space-between;
  padding: ${spacing.sm}px 0;
  border-top: 1px solid ${color.border};
`;

const rangeLabelStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondary};
`;

const rangeValueStyle = css`
  font-size: ${fontSize.label}px;
  font-weight: 600;
  color: ${color.text};
`;

const comparisonCardStyle = css`
  padding: ${spacing.xl}px;
  margin-bottom: ${spacing.lg}px;
`;

const comparisonRowStyle = css`
  display: flex;
  justify-content: space-around;
`;

const comparisonItemStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs}px;
`;

const comparisonLabelStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondary};
`;

const comparisonValueStyle = css`
  font-size: ${fontSize.heading}px;
  font-weight: 700;
  color: ${color.text};
`;

const chartCardStyle = css`
  padding: ${spacing.xl}px;
  margin-bottom: ${spacing.lg}px;
`;

const chartStyle = css`
  display: flex;
  align-items: flex-end;
  gap: ${spacing.xs}px;
  height: 120px;
  overflow-x: auto;
  padding-bottom: ${spacing.xl}px;
`;

const chartBarGroupStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  flex: 1;
  min-width: 16px;
  position: relative;
`;

const chartBarStyle = (height: number, barColor: string) => css`
  width: 100%;
  height: ${height}px;
  background: ${barColor};
  border-radius: 3px 3px 0 0;
`;

const chartDateStyle = css`
  position: absolute;
  bottom: -18px;
  font-size: 9px;
  color: ${color.textTertiary};
  white-space: nowrap;
`;

const shareButtonStyle = css`
  width: 100%;
  padding: ${spacing.lg}px;
  background: ${color.bgCard};
  border: 1px solid ${color.border};
  border-radius: ${radius.medium}px;
  font-size: ${fontSize.body}px;
  color: ${color.text};
  cursor: pointer;
  text-align: center;
  margin-bottom: ${spacing.lg}px;
`;