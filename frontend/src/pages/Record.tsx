import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CTAButton, useBottomSheet } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import { addRecord } from '../api/bp';
import { useDataCache } from '../contexts/DataCacheContext';
import { BP_LEVEL_CONFIG, TAG_LABELS, POSITION_LABELS } from '../types';
import type { MeasurementTag, MeasurementPosition, BpLevel } from '../types';
import { pageStyle, darkCardStyle, underlineInputStyle } from '../styles/common';
import { color, fontSize, spacing, radius } from '../styles/tokens';
import { useTossBanner } from '../hooks/useTossBanner';

const TAGS: MeasurementTag[] = [
  'MORNING', 'EVENING', 'AFTER_EXERCISE', 'AFTER_MEAL', 'NERVOUS', 'AFTER_DRINKING', 'OTHER',
];

const POSITIONS: MeasurementPosition[] = [
  'SITTING_LEFT', 'SITTING_RIGHT', 'LYING_LEFT', 'LYING_RIGHT', 'STANDING',
];

const POSITION_OPTIONS = [
  { name: '선택 안 함', value: '' },
  ...POSITIONS.map(p => ({ name: POSITION_LABELS[p], value: p })),
];

function PositionSelector({ value, onChange }: {
  value: MeasurementPosition | null;
  onChange: (v: MeasurementPosition | null) => void;
}) {
  const { open, close } = useBottomSheet();

  const handleOpen = () => {
    open({
      header: '측정 자세 선택',
      children: (
        <div css={sheetListStyle}>
          {POSITION_OPTIONS.map(opt => {
            const isSelected = (opt.value || null) === value;
            return (
              <button
                key={opt.value}
                css={[sheetItemStyle, isSelected && sheetItemActiveStyle]}
                onClick={() => {
                  onChange(opt.value ? opt.value as MeasurementPosition : null);
                  close();
                }}
              >
                <span>{opt.name}</span>
                {isSelected && <span css={sheetCheckStyle}>✓</span>}
              </button>
            );
          })}
        </div>
      ),
    });
  };

  return (
    <button type="button" css={positionSelectorButtonStyle} onClick={handleOpen}>
      <span>
        {value ? POSITION_LABELS[value] : '선택 안 함'}
      </span>
      <span css={positionArrowStyle}>▼</span>
    </button>
  );
}

function classifyBpLevel(systolic: number, diastolic?: number): BpLevel {
  if (systolic < 90 || (diastolic != null && diastolic < 60)) return 'LOW';
  if (systolic >= 160 || (diastolic != null && diastolic >= 100)) return 'HIGH_2';
  if (systolic >= 140 || (diastolic != null && diastolic >= 90)) return 'HIGH_1';
  if (systolic >= 120 || (diastolic != null && diastolic >= 80)) return 'ELEVATED';
  return 'NORMAL';
}

function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

export default function Record() {
  const navigate = useNavigate();
  const cache = useDataCache();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [tag, setTag] = useState<MeasurementTag | null>(null);
  const [measurementPosition, setMeasurementPosition] = useState<MeasurementPosition | null>(null);
  const [measuredAt, setMeasuredAt] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<BpLevel | null>(null);
  const [step, setStep] = useState(0);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const { containerRef: bannerRef } = useTossBanner(import.meta.env.VITE_AD_BANNER_ID);

  const isValid = systolic && diastolic && pulse &&
    Number(systolic) > 0 && Number(diastolic) > 0 && Number(pulse) > 0;

  const bpFilled = Number(systolic) > 0 && Number(diastolic) > 0 && Number(pulse) > 0;
  const expandedStep = editingStep != null && editingStep < step ? editingStep : step;

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    try {
      const record = await addRecord({
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(pulse),
        tag: tag ?? undefined,
        measurementPosition: measurementPosition ?? undefined,
        measuredAt: measuredAt ? new Date(measuredAt).toISOString() : undefined,
      });
      setResult(record.level);
      cache.invalidate('todaySummary');
    } catch (error) {
      console.error('기록 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  // 실시간 혈압 판정
  const liveLevel = systolic ? classifyBpLevel(Number(systolic), diastolic ? Number(diastolic) : undefined) : null;
  const liveLevelConfig = liveLevel ? BP_LEVEL_CONFIG[liveLevel] : null;
  const resultConfig = result ? BP_LEVEL_CONFIG[result] : null;

  return (
    <div css={result ? [pageStyle, resultContainerStyle] : pageStyle}>
      {result ? (
        <>
          <div css={[darkCardStyle, resultCardInnerStyle]}>
            <div css={resultLevelBadgeStyle(resultConfig!.color)}>{resultConfig!.label}</div>
            <p css={resultMessageStyle}>{resultConfig!.message}</p>
            <div css={resultValuesStyle}>
              <div css={resultValueGroupStyle}>
                <span css={resultValueNumberStyle}>{systolic}</span>
                <span css={resultValueUnitStyle}>수축기</span>
              </div>
              <span css={resultSlashStyle}>/</span>
              <div css={resultValueGroupStyle}>
                <span css={resultValueNumberStyle}>{diastolic}</span>
                <span css={resultValueUnitStyle}>이완기</span>
              </div>
              <div css={resultValueGroupStyle}>
                <span css={resultPulseNumberStyle}>{pulse}</span>
                <span css={resultValueUnitStyle}>맥박</span>
              </div>
            </div>
          </div>
          {/* @ts-expect-error CTAButton children type mismatch with framer-motion */}
          <CTAButton onClick={() => navigate('/statistics', { replace: true })}>
            확인
          </CTAButton>
          <button css={recordAgainStyle} onClick={() => {
            setResult(null);
            setSystolic('');
            setDiastolic('');
            setPulse('');
            setTag(null);
            setMeasurementPosition(null);
            setStep(0);
            setEditingStep(null);
          }}>
            한 번 더 기록하기
          </button>
        </>
      ) : (
        <>
          {/* Step 0: 혈압 입력 */}
          {expandedStep === 0 ? (
            <div css={darkCardStyle}>
              <h2 css={darkCardTitleStyle}>혈압 기록</h2>

              <div css={darkInputRowStyle}>
                <div css={darkInputGroupStyle}>
                  <label css={darkInputLabelStyle}>수축기</label>
                  <input
                    css={underlineInputStyle}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="120"
                    value={systolic}
                    onChange={e => setSystolic(onlyDigits(e.target.value))}
                    autoFocus
                  />
                  <span css={darkInputUnitStyle}>mmHg</span>
                </div>
                <div css={darkInputGroupStyle}>
                  <label css={darkInputLabelStyle}>이완기</label>
                  <input
                    css={underlineInputStyle}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="80"
                    value={diastolic}
                    onChange={e => setDiastolic(onlyDigits(e.target.value))}
                  />
                  <span css={darkInputUnitStyle}>mmHg</span>
                </div>
                <div css={darkInputGroupStyle}>
                  <label css={darkInputLabelStyle}>맥박</label>
                  <input
                    css={underlineInputStyle}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="72"
                    value={pulse}
                    onChange={e => setPulse(onlyDigits(e.target.value))}
                  />
                  <span css={darkInputUnitStyle}>bpm</span>
                </div>
              </div>

              {/* 측정 시간 */}
              <div css={darkDatetimeGroupStyle}>
                <label css={darkInputLabelStyle}>측정 시간</label>
                <input
                  css={datetimeInputStyle}
                  type="datetime-local"
                  value={measuredAt}
                  onChange={e => setMeasuredAt(e.target.value)}
                />
              </div>

              {/* 실시간 판정 */}
              {liveLevelConfig && Number(systolic) > 0 && (
                <div css={liveLevelStyle(liveLevelConfig.color)}>
                  {liveLevelConfig.label} - {liveLevelConfig.message}
                </div>
              )}

              {/* 다음 / 완료 버튼 */}
              {bpFilled && (
                <button css={stepNextButtonStyle} onClick={() => {
                  if (editingStep === 0) {
                    setEditingStep(null);
                  } else {
                    setStep(1);
                  }
                }}>
                  {editingStep === 0 ? '완료' : '다음'}
                </button>
              )}
            </div>
          ) : step > 0 ? (
            <div css={completedStepStyle} onClick={() => setEditingStep(0)}>
              <div css={completedMainStyle}>
                <span css={completedLabelStyle}>혈압</span>
                <span css={completedValueStyle}>{systolic}/{diastolic} mmHg · {pulse}bpm</span>
              </div>
              {liveLevelConfig && (
                <span css={completedBadgeStyle(liveLevelConfig.color)}>{liveLevelConfig.label}</span>
              )}
            </div>
          ) : null}

          {/* Step 1: 측정 자세 */}
          {step >= 1 && (
            expandedStep === 1 ? (
              <div css={whiteCardStyle}>
                <div css={whiteInputGroupStyle}>
                  <label css={whiteInputLabelStyle}>측정 자세</label>
                  <PositionSelector
                    value={measurementPosition}
                    onChange={(v) => {
                      setMeasurementPosition(v);
                      if (v != null) {
                        if (editingStep === 1) {
                          setEditingStep(null);
                        } else if (step === 1) {
                          setStep(2);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : step > 1 ? (
              <div css={completedStepStyle} onClick={() => setEditingStep(1)}>
                <div css={completedMainStyle}>
                  <span css={completedLabelStyle}>자세</span>
                  <span css={completedValueStyle}>{POSITION_LABELS[measurementPosition!]}</span>
                </div>
              </div>
            ) : null
          )}

          {/* Step 2: 상황 선택 */}
          {step >= 2 && (
            expandedStep === 2 ? (
              <div css={whiteCardStyle}>
                <div css={whiteInputGroupStyle}>
                  <label css={whiteInputLabelStyle}>상황</label>
                  <div css={tagListStyle}>
                    {TAGS.map(t => (
                      <button
                        key={t}
                        css={[tagButtonStyle, tag === t && tagActiveStyle]}
                        onClick={() => {
                          const newTag = tag === t ? null : t;
                          setTag(newTag);
                          if (newTag != null) {
                            if (editingStep === 2) {
                              setEditingStep(null);
                            } else if (step === 2) {
                              setStep(3);
                            }
                          }
                        }}
                      >
                        {TAG_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : step > 2 ? (
              <div css={completedStepStyle} onClick={() => setEditingStep(2)}>
                <div css={completedMainStyle}>
                  <span css={completedLabelStyle}>상황</span>
                  <span css={completedValueStyle}>{TAG_LABELS[tag!]}</span>
                </div>
              </div>
            ) : null
          )}

          {/* Step 3: 저장 버튼 */}
          {step >= 3 && (
            <div css={saveButtonWrapperStyle}>
              <button
                css={saveButtonStyle}
                onClick={handleSave}
                disabled={!isValid || saving}
              >
                {saving ? '저장 중...' : '기록 추가'}
              </button>
            </div>
          )}
        </>
      )}

      {/* 배너 광고 - 항상 하단에 표시 */}
      <div ref={bannerRef} css={bannerStyle} />
    </div>
  );
}

// === Banner ad ===
const bannerStyle = css`
  width: 100%;
  min-height: 50px;
  margin-top: auto;
  padding-top: ${spacing.lg}px;
  border-radius: ${radius.medium}px;
  overflow: hidden;
`;

// === Dark card styles ===
const darkCardTitleStyle = css`
  font-size: ${fontSize.heading}px;
  font-weight: 700;
  color: ${color.textOnDark};
  margin-bottom: ${spacing.xl}px;
`;

const darkInputRowStyle = css`
  display: flex;
  gap: ${spacing.md}px;
  margin-bottom: ${spacing.lg}px;
`;

const darkInputGroupStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs}px;
`;

const darkInputLabelStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondaryOnDark};
`;

const darkInputUnitStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondaryOnDark};
  margin-top: 2px;
`;

const darkDatetimeGroupStyle = css`
  margin-bottom: ${spacing.lg}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs}px;
`;

const datetimeInputStyle = css`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${radius.medium}px;
  color: ${color.textOnDark};
  font-size: ${fontSize.label}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  outline: none;
  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
`;

const liveLevelStyle = (c: string) => css`
  text-align: center;
  padding: ${spacing.md}px;
  background: ${c}20;
  color: ${c};
  border-radius: ${radius.medium}px;
  font-size: ${fontSize.body}px;
  font-weight: 600;
  margin-top: ${spacing.sm}px;
`;

// === White card styles ===
const whiteCardStyle = css`
  background: ${color.bgCard};
  border-radius: ${radius.card}px;
  padding: ${spacing.xl}px;
  margin-top: ${spacing.lg}px;
`;

const whiteInputGroupStyle = css`
  margin-bottom: ${spacing.lg}px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const whiteInputLabelStyle = css`
  display: block;
  font-size: ${fontSize.label}px;
  font-weight: 600;
  color: ${color.textSecondary};
  margin-bottom: ${spacing.sm}px;
`;

const positionSelectorButtonStyle = css`
  width: 100%;
  padding: ${spacing.md}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.medium}px;
  font-size: ${fontSize.body}px;
  background: ${color.bgCard};
  color: ${color.text};
  min-height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
`;

const positionArrowStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondary};
`;

const sheetListStyle = css`
  display: flex;
  flex-direction: column;
`;

const sheetItemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.lg}px ${spacing.xl}px;
  background: none;
  border: none;
  border-bottom: 1px solid ${adaptive.grey100};
  font-size: ${fontSize.body}px;
  color: ${adaptive.grey900};
  cursor: pointer;
  text-align: left;
  &:last-child {
    border-bottom: none;
  }
`;

const sheetItemActiveStyle = css`
  color: ${adaptive.blue500};
  font-weight: 600;
`;

const sheetCheckStyle = css`
  color: ${adaptive.blue500};
  font-size: ${fontSize.body}px;
  font-weight: 700;
`;

const tagListStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm}px;
`;

const tagButtonStyle = css`
  padding: ${spacing.sm}px ${spacing.md}px;
  border: 1px solid ${color.border};
  border-radius: ${radius.pill}px;
  background: ${color.bgCard};
  color: ${color.textSecondary};
  font-size: ${fontSize.label}px;
  cursor: pointer;
  min-height: 36px;
`;

const tagActiveStyle = css`
  background: ${color.primary};
  color: white;
  border-color: ${color.primary};
`;

// === Completed step styles ===
const completedStepStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${color.bgCardDark};
  border-radius: ${radius.card}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  margin-bottom: ${spacing.sm}px;
  cursor: pointer;
  min-height: 48px;
`;

const completedMainStyle = css`
  display: flex;
  align-items: center;
  gap: ${spacing.md}px;
`;

const completedLabelStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondaryOnDark};
  min-width: 28px;
`;

const completedValueStyle = css`
  font-size: ${fontSize.body}px;
  color: ${color.textOnDark};
  font-weight: 600;
`;

const completedBadgeStyle = (c: string) => css`
  font-size: ${fontSize.caption}px;
  color: ${c};
  font-weight: 600;
  padding: 2px ${spacing.sm}px;
  background: ${c}20;
  border-radius: ${radius.pill}px;
`;

const stepNextButtonStyle = css`
  display: block;
  width: 100%;
  margin-top: ${spacing.lg}px;
  padding: ${spacing.md}px;
  background: ${color.primary};
  border: none;
  border-radius: ${radius.medium}px;
  color: white;
  font-size: ${fontSize.body}px;
  font-weight: 600;
  cursor: pointer;
`;

// === Save button ===
const saveButtonWrapperStyle = css`
  margin-top: ${spacing.xl}px;
`;

const saveButtonStyle = css`
  width: 100%;
  padding: ${spacing.lg}px;
  background: ${color.primary};
  color: white;
  border: none;
  border-radius: ${radius.card}px;
  font-size: ${fontSize.body}px;
  font-weight: 700;
  cursor: pointer;
  min-height: 56px;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// === Result screen ===
const resultContainerStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80vh;
  gap: ${spacing.lg}px;
`;

const resultCardInnerStyle = css`
  text-align: center;
  padding: ${spacing.xxl * 2}px ${spacing.xxl}px;
`;

const resultLevelBadgeStyle = (c: string) => css`
  display: inline-block;
  padding: ${spacing.sm}px ${spacing.xl}px;
  background: ${c}30;
  color: ${c};
  border-radius: ${radius.pill}px;
  font-size: ${fontSize.heading}px;
  font-weight: 700;
  margin-bottom: ${spacing.md}px;
`;

const resultMessageStyle = css`
  font-size: ${fontSize.body}px;
  color: ${color.textSecondaryOnDark};
  margin-bottom: ${spacing.xl}px;
`;

const resultValuesStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.lg}px;
`;

const resultValueGroupStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const resultValueNumberStyle = css`
  font-size: ${fontSize.numberLarge}px;
  font-weight: 700;
  color: ${color.textOnDark};
`;

const resultPulseNumberStyle = css`
  font-size: ${fontSize.number}px;
  font-weight: 700;
  color: ${color.textOnDark};
`;

const resultSlashStyle = css`
  font-size: ${fontSize.number}px;
  color: ${color.textSecondaryOnDark};
  margin-top: -${spacing.lg}px;
`;

const resultValueUnitStyle = css`
  font-size: ${fontSize.caption}px;
  color: ${color.textSecondaryOnDark};
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
