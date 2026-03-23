import client from './client';

export async function oauthLogin(provider: string, code: string, referrer?: string) {
  const { data } = await client.post('/api/auth/oauth', { provider, code, referrer });
  return data as { token: string; isNewUser: boolean };
}

export async function localLogin(email: string, password: string) {
  const { data } = await client.post('/api/auth/login', { email, password });
  return data as { token: string; isNewUser: boolean };
}

export async function register(email: string, password: string) {
  const { data } = await client.post('/api/auth/register', { email, password });
  return data as { token: string; isNewUser: boolean };
}

export async function withdraw() {
  await client.post('/api/users/withdraw');
}