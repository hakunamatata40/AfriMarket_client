import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'afrimarket_client_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function clearToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function buildHeaders(withAuth = true): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (withAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiPut<T>(url: string, body: object): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Erreur réseau (${res.status})` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiGet<T>(url: string): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Erreur réseau (${res.status})` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(url: string, body: object, withAuth = true): Promise<T> {
  const headers = await buildHeaders(withAuth);
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Erreur réseau (${res.status})` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
