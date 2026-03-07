export type MeasurementTag =
  | 'AFTER_EXERCISE'
  | 'AFTER_MEAL'
  | 'NERVOUS'
  | 'AFTER_DRINKING'
  | 'MORNING'
  | 'EVENING'
  | 'OTHER'

export type MeasurementPosition =
  | 'SITTING_LEFT'
  | 'SITTING_RIGHT'
  | 'LYING_LEFT'
  | 'LYING_RIGHT'
  | 'STANDING'

export type BpLevel = 'LOW' | 'NORMAL' | 'ELEVATED' | 'HIGH_1' | 'HIGH_2'

export interface RecordResponse {
  id: number
  systolic: number
  diastolic: number
  pulse: number
  tag: MeasurementTag | null
  memo: string | null
  level: BpLevel
  measuredAt: string
  weight: number | null
  measurementPosition: MeasurementPosition | null
}

export interface TodaySummaryResponse {
  latestRecord: RecordResponse | null
  todayRecordCount: number
  weekRecords: RecordResponse[]
}

export interface StatsResponse {
  records: RecordResponse[]
  avgSystolic: number
  avgDiastolic: number
  avgPulse: number
  maxSystolic: number
  minSystolic: number
  maxDiastolic: number
  minDiastolic: number
  maxPulse: number
  minPulse: number
  avgWeight: number | null
  maxWeight: number | null
  minWeight: number | null
  morningAvgSystolic: number | null
  eveningAvgSystolic: number | null
  morningAvgDiastolic: number | null
  eveningAvgDiastolic: number | null
}

export interface NotificationSetting {
  enabled: boolean
  morningHour: number | null
  eveningHour: number | null
}

export interface Medication {
  id: number
  name: string
  dosageTime: number | null
  enabled: boolean
}

export const BP_LEVEL_CONFIG: Record<BpLevel, { label: string; color: string; message: string }> = {
  LOW: { label: '저혈압', color: '#3498DB', message: '어지러우면 병원에 가세요' },
  NORMAL: { label: '정상', color: '#27AE60', message: '좋아요!' },
  ELEVATED: { label: '주의', color: '#F39C12', message: '관리가 필요해요' },
  HIGH_1: { label: '고혈압 1단계', color: '#E67E22', message: '의사와 상의하세요' },
  HIGH_2: { label: '고혈압 2단계', color: '#C0392B', message: '즉시 병원 방문 권고' },
}

export const TAG_LABELS: Record<MeasurementTag, string> = {
  AFTER_EXERCISE: '운동 후',
  AFTER_MEAL: '식후',
  NERVOUS: '긴장',
  AFTER_DRINKING: '음주 후',
  MORNING: '아침',
  EVENING: '저녁',
  OTHER: '기타',
}

export const POSITION_LABELS: Record<MeasurementPosition, string> = {
  SITTING_LEFT: '왼쪽팔 앉은 자세',
  SITTING_RIGHT: '오른쪽팔 앉은 자세',
  LYING_LEFT: '왼쪽팔 누운 자세',
  LYING_RIGHT: '오른쪽팔 누운 자세',
  STANDING: '서있는 자세',
}