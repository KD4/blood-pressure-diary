import client from './client';
import type { NotificationSetting, Medication } from '../types';

export async function getNotificationSetting(): Promise<NotificationSetting> {
  const { data } = await client.get('/api/users/notification');
  return data;
}

export async function updateNotificationSetting(setting: NotificationSetting): Promise<NotificationSetting> {
  const { data } = await client.put('/api/users/notification', setting);
  return data;
}

export async function getMedications(): Promise<Medication[]> {
  const { data } = await client.get('/api/users/medications');
  return data;
}

export async function addMedication(med: { name: string; dosageTime?: number }): Promise<Medication> {
  const { data } = await client.post('/api/users/medications', med);
  return data;
}

export async function updateMedication(id: number, med: { name: string; dosageTime?: number; enabled?: boolean }): Promise<Medication> {
  const { data } = await client.put(`/api/users/medications/${id}`, med);
  return data;
}

export async function deleteMedication(id: number): Promise<void> {
  await client.delete(`/api/users/medications/${id}`);
}