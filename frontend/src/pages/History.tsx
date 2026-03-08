import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useDialog } from '@toss/tds-mobile';
import { getAllRecords, deleteRecord, seedDummyRecords } from '../api/bp';
import { BP_LEVEL_CONFIG, TAG_LABELS, POSITION_LABELS } from '../types';
import type { RecordResponse } from '../types';
import BpLevelLegend from '../components/BpLevelLegend';
import { pageStyle } from '../styles/common';
import { color, fontSize, spacing, radius } from '../styles/tokens';

export default function History() {
  const [records, setRecords] = useState<RecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { openConfirm } = useDialog();

  const loadRecords = () => {
    setLoading(true);
    getAllRecords(365)
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRecords(); }, []);

  const handleDelete = async (record: RecordResponse) => {
    if (deletingId) return;

    const d = new Date(record.measuredAt);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const confirmed = await openConfirm({
      title: '기록을 삭제할까요?',
      description: `${dateStr} 측정 (${record.systolic}/${record.diastolic}) 기록이 삭제됩니다.`,
      confirmButton: '삭제',
      cancelButton: '취소',
    });

    if (!confirmed) return;

    setDeletingId(record.id);
    try {
      await deleteRecord(record.id);
      setRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (error) {
      console.error('삭제 실패:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeedDummy = () => {
    const count = seedDummyRecords(100);
    alert(`더미 데이터 ${count}건 추가 완료`);
    loadRecords();
  };

  // 날짜별 그룹핑 (measuredAt 기준 정렬)
  const sorted = [...records].sort((a, b) =>
    new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
  );

  const grouped = sorted.reduce<Record<string, RecordResponse[]>>((acc, record) => {
    const date = record.measuredAt.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div css={pageStyle}>
      <BpLevelLegend />

      {loading ? (
        <p css={loadingTextStyle}>불러오는 중...</p>
      ) : records.length === 0 ? (
        <div css={emptyContainerStyle}>
          <div css={emptyIconStyle}>📋</div>
          <p css={emptyTextStyle}>기록이 없습니다</p>
          <p css={emptySubTextStyle}>기록 탭에서 혈압을 측정해보세요</p>
          <button css={seedButtonStyle} onClick={handleSeedDummy}>
            테스트용 더미 데이터 추가 (100일)
          </button>
        </div>
      ) : (
        <>
          <div css={listCardStyle}>
            {sortedDates.map(date => (
              <div key={date}>
                <div css={dateHeaderStyle}>
                  {formatDateHeader(date)}
                </div>
                {grouped[date].map(record => {
                  const levelConfig = BP_LEVEL_CONFIG[record.level];
                  return (
                    <div key={record.id} css={recordRowStyle}>
                      <div css={colorBarStyle(levelConfig.color)} />
                      <div css={recordContentStyle}>
                        <div css={recordMainRowStyle}>
                          <span css={recordTimeStyle}>
                            {new Date(record.measuredAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                          <span css={recordBpStyle}>
                            {record.systolic}/{record.diastolic}
                          </span>
                          <span css={recordPulseStyle}>
                            {record.pulse} bpm
                          </span>
                        </div>
                        <div css={recordBadgeRowStyle}>
                          {record.measurementPosition && (
                            <span css={neutralBadgeStyle}>{POSITION_LABELS[record.measurementPosition]}</span>
                          )}
                          {record.tag && (
                            <span css={neutralBadgeStyle}>{TAG_LABELS[record.tag]}</span>
                          )}
                          <span css={levelBadgeStyle(levelConfig.color)}>
                            {levelConfig.label}
                          </span>
                        </div>
                      </div>
                      <button
                        css={deleteButtonStyle}
                        onClick={() => handleDelete(record)}
                        disabled={deletingId === record.id}
                      >
                        {deletingId === record.id ? '...' : '삭제'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <button css={seedButtonStyle} onClick={handleSeedDummy}>
            테스트용 더미 데이터 추가
          </button>
        </>
      )}
    </div>
  );
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${weekdays[d.getDay()]})`;
}

const loadingTextStyle = css`
  text-align: center;
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
  padding: ${spacing.xxl}px;
`;

const emptyContainerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xxl * 3}px ${spacing.xl}px;
`;

const emptyIconStyle = css`
  font-size: 48px;
  margin-bottom: ${spacing.md}px;
`;

const emptyTextStyle = css`
  font-size: ${fontSize.body}px;
  font-weight: 600;
  color: ${color.text};
`;

const emptySubTextStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textTertiary};
  margin-top: ${spacing.xs}px;
`;

const listCardStyle = css`
  background: ${color.bgCard};
  border-radius: ${radius.card}px;
  overflow: hidden;
`;

const dateHeaderStyle = css`
  padding: ${spacing.md}px ${spacing.xl}px;
  font-size: ${fontSize.label}px;
  font-weight: 600;
  color: ${color.textSecondary};
  background: ${color.bgPage};
`;

const recordRowStyle = css`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${color.border};
  &:last-child {
    border-bottom: none;
  }
`;

const colorBarStyle = (c: string) => css`
  width: 4px;
  align-self: stretch;
  background: ${c};
  flex-shrink: 0;
`;

const recordContentStyle = css`
  flex: 1;
  padding: ${spacing.md}px ${spacing.lg}px;
  min-width: 0;
`;

const recordMainRowStyle = css`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
`;

const recordBadgeRowStyle = css`
  display: flex;
  align-items: center;
  gap: ${spacing.xs}px;
  margin-top: ${spacing.xs}px;
`;

const recordTimeStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondary};
  min-width: 50px;
`;

const recordBpStyle = css`
  font-size: ${fontSize.body}px;
  font-weight: 700;
  color: ${color.text};
`;

const recordPulseStyle = css`
  font-size: ${fontSize.label}px;
  color: ${color.textSecondary};
`;

const neutralBadgeStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondary};
  background: ${color.bgPage};
  padding: 2px ${spacing.sm}px;
  border-radius: ${radius.pill}px;
`;

const levelBadgeStyle = (c: string) => css`
  font-size: ${fontSize.caption}px;
  color: ${c};
  background: ${c}15;
  padding: 2px ${spacing.sm}px;
  border-radius: ${radius.pill}px;
  margin-left: auto;
`;

const deleteButtonStyle = css`
  flex-shrink: 0;
  padding: ${spacing.sm}px ${spacing.md}px;
  margin-right: ${spacing.md}px;
  background: none;
  border: 1px solid ${color.danger};
  border-radius: ${radius.medium}px;
  color: ${color.danger};
  font-size: ${fontSize.caption}px;
  cursor: pointer;
  min-height: 32px;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const seedButtonStyle = css`
  display: block;
  width: 100%;
  margin-top: ${spacing.lg}px;
  padding: ${spacing.md}px;
  background: none;
  border: 1px dashed ${color.textTertiary};
  border-radius: ${radius.medium}px;
  color: ${color.textTertiary};
  font-size: ${fontSize.caption}px;
  cursor: pointer;
`;
