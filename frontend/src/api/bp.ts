import client from './client';
import type { RecordResponse, TodaySummaryResponse, StatsResponse, MeasurementTag, MeasurementPosition } from '../types';

interface RecordRequest {
  systolic: number;
  diastolic: number;
  pulse: number;
  tag?: MeasurementTag;
  memo?: string;
  measuredAt?: string;
  weight?: number;
  measurementPosition?: MeasurementPosition;
}

export async function addRecord(request: RecordRequest): Promise<RecordResponse> {
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (isGuest) {
    const records = getGuestRecords();
    const newRecord: RecordResponse = {
      id: Date.now(),
      ...request,
      tag: request.tag ?? null,
      memo: request.memo ?? null,
      weight: request.weight ?? null,
      measurementPosition: request.measurementPosition ?? null,
      level: classifyBpLevel(request.systolic, request.diastolic),
      measuredAt: request.measuredAt ?? new Date().toISOString(),
    };
    records.unshift(newRecord);
    localStorage.setItem('guestRecords', JSON.stringify(records));
    return newRecord;
  }

  const { data } = await client.post('/api/bp/records', request);
  return data;
}

export async function getTodaySummary(): Promise<TodaySummaryResponse> {
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (isGuest) {
    const records = getGuestRecords();
    const today = new Date().toISOString().slice(0, 10);
    const todayRecords = records.filter(r => r.measuredAt.slice(0, 10) === today);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekStart = weekAgo.toISOString().slice(0, 10);
    const weekRecords = records.filter(r => r.measuredAt.slice(0, 10) >= weekStart);

    return {
      latestRecord: todayRecords[0] ?? null,
      todayRecordCount: todayRecords.length,
      weekRecords,
    };
  }

  const { data } = await client.get('/api/bp/today');
  return data;
}

export async function getStats(days: number): Promise<StatsResponse> {
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (isGuest) {
    const records = getGuestRecords();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const filtered = records.filter(r => r.measuredAt.slice(0, 10) >= cutoffStr);

    if (filtered.length === 0) {
      return {
        records: [],
        avgSystolic: 0, avgDiastolic: 0, avgPulse: 0,
        maxSystolic: 0, minSystolic: 0, maxDiastolic: 0, minDiastolic: 0,
        maxPulse: 0, minPulse: 0,
        avgWeight: null, maxWeight: null, minWeight: null,
        morningAvgSystolic: null, eveningAvgSystolic: null,
        morningAvgDiastolic: null, eveningAvgDiastolic: null,
      };
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const morningRecs = filtered.filter(r => {
      const h = new Date(r.measuredAt).getHours();
      return r.tag === 'MORNING' || (h >= 5 && h <= 11);
    });
    const eveningRecs = filtered.filter(r => {
      const h = new Date(r.measuredAt).getHours();
      return r.tag === 'EVENING' || (h >= 17 && h <= 23);
    });
    const weightRecs = filtered.filter(r => r.weight != null);

    return {
      records: filtered,
      avgSystolic: avg(filtered.map(r => r.systolic)),
      avgDiastolic: avg(filtered.map(r => r.diastolic)),
      avgPulse: avg(filtered.map(r => r.pulse)),
      maxSystolic: Math.max(...filtered.map(r => r.systolic)),
      minSystolic: Math.min(...filtered.map(r => r.systolic)),
      maxDiastolic: Math.max(...filtered.map(r => r.diastolic)),
      minDiastolic: Math.min(...filtered.map(r => r.diastolic)),
      maxPulse: Math.max(...filtered.map(r => r.pulse)),
      minPulse: Math.min(...filtered.map(r => r.pulse)),
      avgWeight: weightRecs.length ? avg(weightRecs.map(r => r.weight!)) : null,
      maxWeight: weightRecs.length ? Math.max(...weightRecs.map(r => r.weight!)) : null,
      minWeight: weightRecs.length ? Math.min(...weightRecs.map(r => r.weight!)) : null,
      morningAvgSystolic: morningRecs.length ? avg(morningRecs.map(r => r.systolic)) : null,
      eveningAvgSystolic: eveningRecs.length ? avg(eveningRecs.map(r => r.systolic)) : null,
      morningAvgDiastolic: morningRecs.length ? avg(morningRecs.map(r => r.diastolic)) : null,
      eveningAvgDiastolic: eveningRecs.length ? avg(eveningRecs.map(r => r.diastolic)) : null,
    };
  }

  const { data } = await client.get(`/api/bp/stats?days=${days}`);
  return data;
}

export async function getAllRecords(days: number): Promise<RecordResponse[]> {
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (isGuest) {
    const records = getGuestRecords();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return records.filter(r => r.measuredAt.slice(0, 10) >= cutoffStr);
  }

  const { data } = await client.get(`/api/bp/records?days=${days}`);
  return data;
}

export async function deleteRecord(id: number): Promise<void> {
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (isGuest) {
    const records = getGuestRecords().filter(r => r.id !== id);
    localStorage.setItem('guestRecords', JSON.stringify(records));
    return;
  }

  await client.delete(`/api/bp/records/${id}`);
}

export function seedDummyRecords(days = 100): number {
  const positions: MeasurementPosition[] = ['SITTING_LEFT', 'SITTING_RIGHT', 'LYING_LEFT', 'LYING_RIGHT', 'STANDING'];
  const records = getGuestRecords();
  let count = 0;

  for (let d = 0; d < days; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);

    // 아침 (06:00~08:59)
    const morningHour = 6 + Math.floor(Math.random() * 3);
    const morningMin = Math.floor(Math.random() * 60);
    const mSys = 110 + Math.floor(Math.random() * 30);
    const mDia = 65 + Math.floor(Math.random() * 25);
    const mPulse = 60 + Math.floor(Math.random() * 25);
    const mDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), morningHour, morningMin);
    records.push({
      id: Date.now() - d * 100000 - 1,
      systolic: mSys, diastolic: mDia, pulse: mPulse,
      tag: 'MORNING', memo: null, weight: null,
      measurementPosition: positions[Math.floor(Math.random() * positions.length)],
      level: classifyBpLevel(mSys, mDia),
      measuredAt: mDate.toISOString(),
    });
    count++;

    // 저녁 (18:00~20:59)
    const eveningHour = 18 + Math.floor(Math.random() * 3);
    const eveningMin = Math.floor(Math.random() * 60);
    const eSys = 115 + Math.floor(Math.random() * 35);
    const eDia = 70 + Math.floor(Math.random() * 25);
    const ePulse = 62 + Math.floor(Math.random() * 28);
    const eDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), eveningHour, eveningMin);
    records.push({
      id: Date.now() - d * 100000 - 2,
      systolic: eSys, diastolic: eDia, pulse: ePulse,
      tag: 'EVENING', memo: null, weight: null,
      measurementPosition: positions[Math.floor(Math.random() * positions.length)],
      level: classifyBpLevel(eSys, eDia),
      measuredAt: eDate.toISOString(),
    });
    count++;
  }

  localStorage.setItem('guestRecords', JSON.stringify(records));
  return count;
}

function getGuestRecords(): RecordResponse[] {
  const saved = localStorage.getItem('guestRecords');
  return saved ? JSON.parse(saved) : [];
}

function classifyBpLevel(systolic: number, diastolic?: number) {
  if (systolic < 90 || (diastolic != null && diastolic < 60)) return 'LOW' as const;
  if (systolic >= 160 || (diastolic != null && diastolic >= 100)) return 'HIGH_2' as const;
  if (systolic >= 140 || (diastolic != null && diastolic >= 90)) return 'HIGH_1' as const;
  if (systolic >= 120) return 'ELEVATED' as const;
  return 'NORMAL' as const;
}
