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
  const { data } = await client.post('/api/bp/records', request);
  return data;
}

export async function getTodaySummary(): Promise<TodaySummaryResponse> {
  const { data } = await client.get('/api/bp/today');
  return data;
}

export async function getStats(days: number): Promise<StatsResponse> {
  const { data } = await client.get(`/api/bp/stats?days=${days}`);
  return data;
}

export async function getAllRecords(days: number): Promise<RecordResponse[]> {
  const { data } = await client.get(`/api/bp/records?days=${days}`);
  return data;
}

export async function deleteRecord(id: number): Promise<void> {
  await client.delete(`/api/bp/records/${id}`);
}
