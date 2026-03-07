import client from './client';
import type { RecordResponse, TodaySummaryResponse, StatsResponse, MeasurementTag } from '../types';

interface RecordRequest {
  systolic: number;
  diastolic: number;
  pulse: number;
  tag?: MeasurementTag;
  memo?: string;
  measuredAt?: string;
}

export async function addRecord(request: RecordRequest): Promise<RecordResponse> {
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (isGuest) {
    // 게스트: localStorage에 저장
    const records = getGuestRecords();
    const newRecord: RecordResponse = {
      id: Date.now(),
      ...request,
      tag: request.tag ?? null,
      memo: request.memo ?? null,
      level: classifyBpLevel(request.systolic),
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

    return {
      records: filtered,
      avgSystolic: avg(filtered.map(r => r.systolic)),
      avgDiastolic: avg(filtered.map(r => r.diastolic)),
      avgPulse: avg(filtered.map(r => r.pulse)),
      maxSystolic: Math.max(...filtered.map(r => r.systolic)),
      minSystolic: Math.min(...filtered.map(r => r.systolic)),
      maxDiastolic: Math.max(...filtered.map(r => r.diastolic)),
      minDiastolic: Math.min(...filtered.map(r => r.diastolic)),
      morningAvgSystolic: morningRecs.length ? avg(morningRecs.map(r => r.systolic)) : null,
      eveningAvgSystolic: eveningRecs.length ? avg(eveningRecs.map(r => r.systolic)) : null,
      morningAvgDiastolic: morningRecs.length ? avg(morningRecs.map(r => r.diastolic)) : null,
      eveningAvgDiastolic: eveningRecs.length ? avg(eveningRecs.map(r => r.diastolic)) : null,
    };
  }

  const { data } = await client.get(`/api/bp/stats?days=${days}`);
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

function getGuestRecords(): RecordResponse[] {
  const saved = localStorage.getItem('guestRecords');
  return saved ? JSON.parse(saved) : [];
}

function classifyBpLevel(systolic: number) {
  if (systolic < 120) return 'NORMAL' as const;
  if (systolic < 140) return 'ELEVATED' as const;
  if (systolic < 160) return 'HIGH_1' as const;
  return 'HIGH_2' as const;
}