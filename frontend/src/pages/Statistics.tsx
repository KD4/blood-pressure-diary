import { css } from '@emotion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Paragraph, Spacing, Loader } from '@toss/tds-mobile';
import { getStats } from '../api/bp';
import { showInterstitialAd } from '../hooks/useInterstitialAd';
import type { StatsResponse, RecordResponse } from '../types';
import { pageStyle, darkCardStyle } from '../styles/common';
import { color, fontSize, spacing, radius } from '../styles/tokens';

const PERIOD_OPTIONS = [
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '90일', value: 90 },
];

// SVG attribute에는 CSS 변수(var(--xxx))를 직접 쓸 수 없으므로 고정 색상 사용
const SVG_COLORS = {
  grid: '#E5E8EB',
  label: '#B0B8C1',
};

const MIN_POINT_SPACING = 40;

function SvgLineChart({ records, dataKeys, colors: lineColors, labels, height = 200 }: {
  records: RecordResponse[];
  dataKeys: (keyof RecordResponse)[];
  colors: string[];
  labels: string[];
  height?: number;
}) {
  if (records.length === 0) return null;

  const sorted = [...records].sort((a, b) =>
    new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );
  const tooltipH = 20 + dataKeys.length * 18;
  const padding = { top: tooltipH + 10, right: 16, bottom: 48, left: 46 };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setContainerW(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setContainerW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const naturalW = padding.left + padding.right + Math.max(sorted.length - 1, 1) * MIN_POINT_SPACING;
  const chartW = containerW > 0 ? Math.max(naturalW, containerW) : naturalW;
  const chartH = height;
  const innerW = chartW - padding.left - padding.right;
  const innerH = chartH - padding.top - padding.bottom;

  const allValues = dataKeys.flatMap(key => sorted.map(r => r[key] as number));
  const minVal = Math.floor(Math.min(...allValues) * 0.9);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.1);
  const range = maxVal - minVal || 1;

  const getX = (i: number) => padding.left + (innerW / Math.max(sorted.length - 1, 1)) * i;
  const getY = (v: number) => padding.top + innerH - ((v - minVal) / range) * innerH;

  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round(minVal + (range / gridLines) * i)
  );

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll, { passive: true });
    return () => { el?.removeEventListener('scroll', checkScroll); };
  }, [checkScroll, sorted.length, chartW]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div css={chartWrapperStyle}>
      {canScrollLeft && (
        <button css={scrollBtnStyle('left')} onClick={() => scroll('left')} aria-label="왼쪽 스크롤">
          ◀
        </button>
      )}
      {canScrollRight && (
        <button css={scrollBtnStyle('right')} onClick={() => scroll('right')} aria-label="오른쪽 스크롤">
          ▶
        </button>
      )}

      <div ref={scrollRef} css={chartScrollStyle}>
        <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
          {/* 그리드 */}
          {gridValues.map(v => (
            <g key={v}>
              <line x1={padding.left} y1={getY(v)} x2={chartW - padding.right} y2={getY(v)}
                stroke={SVG_COLORS.grid} strokeWidth={0.5} strokeDasharray="4,4" />
              <text x={padding.left - 8} y={getY(v) + 5} textAnchor="end"
                fill={SVG_COLORS.label} fontSize={13} fontWeight={500}>{v}</text>
            </g>
          ))}

          {/* 라인 + 점 */}
          {dataKeys.map((key, ki) => {
            const points = sorted.map((r, i) => `${getX(i)},${getY(r[key] as number)}`);
            return (
              <g key={String(key)}>
                <polyline points={points.join(' ')} fill="none"
                  stroke={lineColors[ki]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                {sorted.map((r, i) => (
                  <circle key={i} cx={getX(i)} cy={getY(r[key] as number)}
                    r={4} fill={lineColors[ki]} stroke="#fff" strokeWidth={1.5} />
                ))}
              </g>
            );
          })}

          {/* X축 날짜 + 시간 */}
          {sorted.map((r, i) => {
            const d = new Date(r.measuredAt);
            const datePart = `${d.getMonth() + 1}/${d.getDate()}`;
            const timePart = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            if (sorted.length > 10 && i % Math.ceil(sorted.length / 10) !== 0) return null;
            return (
              <g key={i}>
                <text x={getX(i)} y={chartH - 18} textAnchor="middle"
                  fill={SVG_COLORS.label} fontSize={11} fontWeight={500}>{datePart}</text>
                <text x={getX(i)} y={chartH - 5} textAnchor="middle"
                  fill={SVG_COLORS.label} fontSize={10}>{timePart}</text>
              </g>
            );
          })}

          {/* 탭 영역 (투명 히트 타겟) */}
          {sorted.map((_, i) => {
            const hitW = innerW / Math.max(sorted.length, 1);
            return (
              <rect key={`hit-${i}`}
                x={getX(i) - hitW / 2} y={padding.top} width={hitW} height={innerH}
                fill="transparent" style={{ cursor: 'pointer' }}
                onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
              />
            );
          })}

          {/* 선택된 포인트: 가이드라인 + 강조 */}
          {selectedIdx != null && (
            <g>
              <line
                x1={getX(selectedIdx)} y1={padding.top}
                x2={getX(selectedIdx)} y2={padding.top + innerH}
                stroke="#666" strokeWidth={1} strokeDasharray="4,4"
              />
              {dataKeys.map((key, ki) => (
                <circle key={`sel-${ki}`}
                  cx={getX(selectedIdx)}
                  cy={getY(sorted[selectedIdx][key] as number)}
                  r={7} fill={lineColors[ki]} stroke="#fff" strokeWidth={2}
                />
              ))}
            </g>
          )}

          {/* 툴팁 */}
          {selectedIdx != null && (() => {
            const r = sorted[selectedIdx];
            const x = getX(selectedIdx);
            const d = new Date(r.measuredAt);
            const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            const tooltipW = 130;
            const tooltipH = 20 + dataKeys.length * 18;
            const tooltipX = Math.max(padding.left, Math.min(x - tooltipW / 2, chartW - padding.right - tooltipW));
            const tooltipY = Math.max(2, padding.top - tooltipH - 8);

            return (
              <g>
                <rect x={tooltipX} y={tooltipY} width={tooltipW} height={tooltipH}
                  rx={6} fill="rgba(30,42,58,0.92)" />
                <text x={tooltipX + tooltipW / 2} y={tooltipY + 16}
                  textAnchor="middle" fill="#fff" fontSize={11} fontWeight={500}>
                  {dateStr}
                </text>
                {dataKeys.map((key, ki) => (
                  <text key={ki} x={tooltipX + tooltipW / 2} y={tooltipY + 34 + ki * 18}
                    textAnchor="middle" fill={lineColors[ki]} fontSize={12} fontWeight={700}>
                    {labels[ki]} {r[key]}
                  </text>
                ))}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* 범례 */}
      <div css={chartLegendStyle}>
        {labels.map((l, i) => (
          <div key={l} css={chartLegendItemStyle}>
            <span css={chartLegendDotStyle(lineColors[i])} />
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Statistics() {
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingDays, setPendingDays] = useState<number | null>(null);
  const [adLoading, setAdLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStats(days)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const handlePeriodClick = (value: number) => {
    if (adLoading) return;
    // 7일은 광고 없이 바로 전환
    if (value === 7) {
      setDays(value);
      return;
    }
    // TTL 내면 광고 스킵
    if (!showInterstitialAd.shouldShow()) {
      setDays(value);
      return;
    }
    // 30일, 90일은 확인 팝업
    setPendingDays(value);
  };

  const handleAdConfirm = async () => {
    const value = pendingDays;
    setPendingDays(null);
    if (!value) return;
    setAdLoading(true);
    try {
      await showInterstitialAd(import.meta.env.VITE_AD_INTERSTITIAL_ID ?? '');
      setDays(value);
    } finally {
      setAdLoading(false);
    }
  };

  const handleAdCancel = () => {
    setPendingDays(null);
  };

  return (
    <div css={pageStyle}>
      {/* 기간 선택 */}
      <div css={periodSelectorStyle}>
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            css={[periodButtonStyle, days === opt.value && periodActiveStyle]}
            onClick={() => handlePeriodClick(opt.value)}
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
          {/* 다크 카드: 요약 테이블 */}
          <div css={darkCardStyle}>
            <h3 css={darkSectionTitleStyle}>요약</h3>
            <div css={statsTableStyle}>
              <div css={statsHeaderRowStyle}>
                <div css={statsHeaderCellStyle} />
                <div css={statsHeaderCellStyle}>최대</div>
                <div css={statsHeaderCellStyle}>최소</div>
                <div css={statsHeaderCellStyle}>평균</div>
              </div>
              <div css={statsDataRowStyle}>
                <div css={statsLabelCellStyle}>수축기</div>
                <div css={statsValueCellStyle}>{stats.maxSystolic}</div>
                <div css={statsValueCellStyle}>{stats.minSystolic}</div>
                <div css={statsValueCellStyle}>{stats.avgSystolic.toFixed(0)}</div>
              </div>
              <div css={statsDataRowStyle}>
                <div css={statsLabelCellStyle}>이완기</div>
                <div css={statsValueCellStyle}>{stats.maxDiastolic}</div>
                <div css={statsValueCellStyle}>{stats.minDiastolic}</div>
                <div css={statsValueCellStyle}>{stats.avgDiastolic.toFixed(0)}</div>
              </div>
              <div css={statsDataRowStyle}>
                <div css={statsLabelCellStyle}>맥박</div>
                <div css={statsValueCellStyle}>{stats.maxPulse}</div>
                <div css={statsValueCellStyle}>{stats.minPulse}</div>
                <div css={statsValueCellStyle}>{stats.avgPulse.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* 화이트 카드: 혈압 변화 차트 */}
          <div css={whiteChartCardStyle}>
            <h3 css={chartTitleStyle}>혈압 변화</h3>
            <SvgLineChart
              records={stats.records}
              dataKeys={['systolic', 'diastolic']}
              colors={['#E74C3C', '#3498DB']}
              labels={['수축기', '이완기']}
              height={220}
            />
          </div>

          {/* 화이트 카드: 맥박 변화 차트 */}
          <div css={whiteChartCardStyle}>
            <h3 css={chartTitleStyle}>맥박 변화</h3>
            <SvgLineChart
              records={stats.records}
              dataKeys={['pulse']}
              colors={['#27AE60']}
              labels={['맥박']}
              height={160}
            />
          </div>
        </>
      )}

      {/* 광고 로딩 오버레이 */}
      {adLoading && (
        <div css={overlayStyle}>
          <div css={adLoadingBoxStyle}>
            <Loader />
            <Spacing size={spacing.md} />
            <Paragraph typography="st8" color="secondary">광고를 불러오는 중...</Paragraph>
          </div>
        </div>
      )}

      {/* 광고 확인 팝업 */}
      {pendingDays && (
        <div css={overlayStyle} onClick={handleAdCancel}>
          <div css={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <Paragraph typography="st8" css={css`text-align: center;`}>
              짧은 광고 후{'\n'}확인 가능해요
            </Paragraph>
            <Spacing size={spacing.lg} />
            <div css={dialogBtnRow}>
              <button css={dialogBtnSecondary} onClick={handleAdCancel}>취소</button>
              <button css={dialogBtnPrimary} onClick={handleAdConfirm}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// === Styles ===

// 광고 오버레이 & 다이얼로그
const overlayStyle = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
`;

const adLoadingBoxStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const dialogStyle = css`
  background: ${color.bgCard};
  border-radius: ${radius.card}px;
  padding: ${spacing.xl}px;
  width: 280px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

const dialogBtnRow = css`
  display: flex;
  gap: ${spacing.sm}px;
`;

const dialogBtnSecondary = css`
  flex: 1;
  padding: ${spacing.md}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.medium}px;
  background: ${color.bgCard};
  font-size: ${fontSize.caption}px;
  font-weight: 600;
  color: ${color.textSecondary};
  cursor: pointer;
`;

const dialogBtnPrimary = css`
  flex: 1;
  padding: ${spacing.md}px;
  border: none;
  border-radius: ${radius.medium}px;
  background: ${color.primary};
  font-size: ${fontSize.caption}px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
`;

const periodSelectorStyle = css`
  display: flex;
  gap: ${spacing.sm}px;
  margin-bottom: ${spacing.lg}px;
`;

const periodButtonStyle = css`
  flex: 1;
  padding: ${spacing.sm}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.pill}px;
  background: ${color.bgCard};
  color: ${color.textSecondary};
  font-size: ${fontSize.label}px;
  cursor: pointer;
  min-height: 40px;
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

// 다크 카드 테이블
const darkSectionTitleStyle = css`
  font-size: ${fontSize.body}px;
  font-weight: 600;
  color: ${color.textOnDark};
  margin-bottom: ${spacing.lg}px;
`;

const statsTableStyle = css`
  display: flex;
  flex-direction: column;
`;

const statsHeaderRowStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: ${spacing.sm}px;
  margin-bottom: ${spacing.sm}px;
`;

const statsHeaderCellStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondaryOnDark};
  text-align: center;
`;

const statsDataRowStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: ${spacing.sm}px;
  padding: ${spacing.sm}px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
`;

const statsLabelCellStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondaryOnDark};
  text-align: center;
`;

const statsValueCellStyle = css`
  font-size: ${fontSize.body}px;
  font-weight: 700;
  color: ${color.textOnDark};
  text-align: center;
`;

// 차트 카드
const whiteChartCardStyle = css`
  background: ${color.bgCard};
  border-radius: ${radius.card}px;
  padding: ${spacing.lg}px ${spacing.xl}px;
  margin-top: ${spacing.md}px;
`;

const chartTitleStyle = css`
  font-size: ${fontSize.body}px;
  font-weight: 600;
  color: ${color.text};
`;

const chartWrapperStyle = css`
  position: relative;
`;

const scrollBtnStyle = (dir: 'left' | 'right') => css`
  position: absolute;
  top: 50%;
  ${dir}: 0;
  transform: translateY(-70%);
  z-index: 1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.45);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

const chartScrollStyle = css`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const chartLegendStyle = css`
  display: flex;
  justify-content: center;
  gap: ${spacing.lg}px;
  margin-top: ${spacing.sm}px;
`;

const chartLegendItemStyle = css`
  display: flex;
  align-items: center;
  gap: ${spacing.xs}px;
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondary};
`;

const chartLegendDotStyle = (c: string) => css`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${c};
`;
