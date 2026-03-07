import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import { addRecord } from '../api/bp';
import { useDataCache } from '../contexts/DataCacheContext';
import { BP_LEVEL_CONFIG, TAG_LABELS } from '../types';
import type { MeasurementTag, BpLevel } from '../types';
import { pageStyle, cardStyle } from '../styles/common';
import { color, fontSize, spacing, radius, layout } from '../styles/tokens';

const TAGS: MeasurementTag[] = [
  'MORNING', 'EVENING', 'AFTER_EXERCISE', 'AFTER_MEAL', 'NERVOUS', 'AFTER_DRINKING', 'OTHER',
];

function classifyBpLevel(systolic: number): BpLevel {
  if (systolic < 120) return 'NORMAL';
  if (systolic < 140) return 'ELEVATED';
  if (systolic < 160) return 'HIGH_1';
  return 'HIGH_2';
}

export default function Record() {
  const navigate = useNavigate();
  const cache = useDataCache();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [tag, setTag] = useState<MeasurementTag | null>(null);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<BpLevel | null>(null);

  const isValid = systolic && diastolic && pulse &&
    Number(systolic) > 0 && Number(diastolic) > 0 && Number(pulse) > 0;

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    try {
      const record = await addRecord({
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(pulse),
        tag: tag ?? undefined,
        memo: memo || undefined,
      });
      setResult(record.level);
      cache.invalidate('todaySummary');
    } catch (error) {
      console.error('기록 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  // 결과 화면
  if (result) {
    const config = BP_LEVEL_CONFIG[result];
    return (
      <div css={[pageStyle, resultContainerStyle]}>
        <div css={resultCardStyle(config.color)}>
          <h2 css={resultLabelStyle}>{config.label}</h2>
          <p css={resultMessageStyle}>{config.message}</p>
          <div css={resultValuesStyle}>
            <span>{systolic}/{diastolic} mmHg</span>
            <span>맥박 {pulse}</span>
          </div>
        </div>
        <Button.Primary size="large" onClick={() => navigate('/home', { replace: true })}>
          확인
        </Button.Primary>
        <button css={recordAgainStyle} onClick={() => {
          setResult(null);
          setSystolic('');
          setDiastolic('');
          setPulse('');
          setTag(null);
          setMemo('');
        }}>
          한 번 더 기록하기
        </button>
      </div>
    );
  }

  // 수축기 입력 시 실시간 색상 피드백
  const liveLevel = systolic ? classifyBpLevel(Number(systolic)) : null;
  const liveLevelConfig = liveLevel ? BP_LEVEL_CONFIG[liveLevel] : null;

  return (
    <div css={pageStyle}>
      <h1 css={headingStyle}>혈압 기록</h1>

      <div css={[cardStyle, inputCardStyle]}>
        {/* 수축기 */}
        <div css={inputGroupStyle}>
          <label css={inputLabelStyle}>수축기 (mmHg)</label>
          <input
            css={[numberInputStyle, systolic && Number(systolic) > 0 && liveLevelConfig && borderColorStyle(liveLevelConfig.color)]}
            type="number"
            inputMode="numeric"
            placeholder="120"
            value={systolic}
            onChange={e => setSystolic(e.target.value)}
            autoFocus
          />
        </div>

        {/* 이완기 */}
        <div css={inputGroupStyle}>
          <label css={inputLabelStyle}>이완기 (mmHg)</label>
          <input
            css={numberInputStyle}
            type="number"
            inputMode="numeric"
            placeholder="80"
            value={diastolic}
            onChange={e => setDiastolic(e.target.value)}
          />
        </div>

        {/* 맥박 */}
        <div css={inputGroupStyle}>
          <label css={inputLabelStyle}>맥박 (bpm)</label>
          <input
            css={numberInputStyle}
            type="number"
            inputMode="numeric"
            placeholder="72"
            value={pulse}
            onChange={e => setPulse(e.target.value)}
          />
        </div>

        {/* 실시간 판정 */}
        {liveLevelConfig && Number(systolic) > 0 && (
          <div css={liveLevelStyle(liveLevelConfig.color)}>
            {liveLevelConfig.label} - {liveLevelConfig.message}
          </div>
        )}
      </div>

      {/* 태그 선택 */}
      <div css={tagSectionStyle}>
        <label css={inputLabelStyle}>상황 (선택)</label>
        <div css={tagListStyle}>
          {TAGS.map(t => (
            <button
              key={t}
              css={[tagButtonStyle, tag === t && tagActiveStyle]}
              onClick={() => setTag(tag === t ? null : t)}
            >
              {TAG_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* 메모 */}
      <div css={memoSectionStyle}>
        <label css={inputLabelStyle}>메모 (선택)</label>
        <input
          css={memoInputStyle}
          type="text"
          placeholder="메모를 입력하세요"
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />
      </div>

      {/* 저장 버튼 */}
      <Button.Primary
        size="large"
        onClick={handleSave}
        disabled={!isValid || saving}
      >
        {saving ? '저장 중...' : '저장하기'}
      </Button.Primary>
    </div>
  );
}

const headingStyle = css`
  font-size: ${fontSize.title}px;
  font-weight: 700;
  color: ${color.text};
  margin: ${spacing.xl}px 0 ${spacing.lg}px;
`;

const inputCardStyle = css`
  padding: ${spacing.xl}px;
  margin-bottom: ${spacing.lg}px;
`;

const inputGroupStyle = css`
  margin-bottom: ${spacing.lg}px;
`;

const inputLabelStyle = css`
  display: block;
  font-size: ${fontSize.body}px;
  font-weight: 600;
  color: ${color.text};
  margin-bottom: ${spacing.sm}px;
`;

const numberInputStyle = css`
  width: 100%;
  padding: ${spacing.lg}px;
  border: 2px solid ${color.border};
  border-radius: ${radius.medium}px;
  font-size: ${fontSize.number}px;
  font-weight: 700;
  text-align: center;
  background: ${color.bgCard};
  color: ${color.text};
  outline: none;
  min-height: ${layout.minTouchTarget}px;
  &:focus {
    border-color: ${color.primary};
  }
  &::placeholder {
    color: ${color.textTertiary};
    font-weight: 400;
  }
  /* 스피너 숨기기 */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const borderColorStyle = (c: string) => css`
  border-color: ${c};
`;

const liveLevelStyle = (c: string) => css`
  text-align: center;
  padding: ${spacing.md}px;
  background: ${c}15;
  color: ${c};
  border-radius: ${radius.medium}px;
  font-size: ${fontSize.body}px;
  font-weight: 600;
`;

const tagSectionStyle = css`
  margin-bottom: ${spacing.lg}px;
`;

const tagListStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm}px;
  margin-top: ${spacing.sm}px;
`;

const tagButtonStyle = css`
  padding: ${spacing.sm}px ${spacing.lg}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.pill}px;
  background: ${color.bgCard};
  color: ${color.textSecondary};
  font-size: ${fontSize.label}px;
  cursor: pointer;
  min-height: 40px;
`;

const tagActiveStyle = css`
  background: ${color.primary};
  color: white;
  border-color: ${color.primary};
`;

const memoSectionStyle = css`
  margin-bottom: ${spacing.xxl}px;
`;

const memoInputStyle = css`
  width: 100%;
  padding: ${spacing.md}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.medium}px;
  font-size: ${fontSize.body}px;
  background: ${color.bgCard};
  color: ${color.text};
  outline: none;
  min-height: ${layout.minTouchTarget}px;
  &:focus {
    border-color: ${color.primary};
  }
`;

const resultContainerStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80vh;
  gap: ${spacing.lg}px;
`;

const resultCardStyle = (c: string) => css`
  background: ${c}10;
  border: 2px solid ${c};
  border-radius: ${radius.card}px;
  padding: ${spacing.xxl * 2}px ${spacing.xxl}px;
  text-align: center;
`;

const resultLabelStyle = css`
  font-size: ${fontSize.title}px;
  font-weight: 700;
  margin-bottom: ${spacing.sm}px;
`;

const resultMessageStyle = css`
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
  margin-bottom: ${spacing.xl}px;
`;

const resultValuesStyle = css`
  display: flex;
  justify-content: center;
  gap: ${spacing.xl}px;
  font-size: ${fontSize.heading}px;
  font-weight: 600;
  color: ${color.text};
`;

const recordAgainStyle = css`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${fontSize.body}px;
  color: ${color.textSecondary};
  padding: ${spacing.md}px;
  text-align: center;
`;