export interface Pin {
  id: number;
  name: string;
  active: boolean;
  activeByDefault: boolean;
}

export interface PinMode {
  pinId: number;
  /** 0 = off, 1 = on, 2 = unchanged */
  mode: number;
}

export interface Schema {
  id: string;
  name: string;
  active: boolean;
  running: boolean;
  min: number;
  max: number;
  modes: PinMode[];
}

export interface Settings {
  oneSchemaMode: boolean;
  multiSchemaPriority: 'highest' | 'lowest';
  reportEmail: string;
}

export interface Dashboard {
  temperature: number | null;
  sensorError: string | null;
  simulated: boolean;
  activeSchemas: { id: string; name: string; running: boolean; min: number; max: number }[];
  pins: { id: number; name: string; active: boolean }[];
}

export interface TemperatureStats {
  count: number;
  first: number | null;
  last: number | null;
}

const TOKEN_KEY = 'token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode: stay logged in for this tab only */
  }
};

type Result<T> = { data: T; error?: undefined } | { data?: undefined; error: Error };

/** Calls the backend. A 401 drops the token and sends the user to the login page. */
export async function request<T>(method: string, url: string, body?: unknown): Promise<Result<T>> {
  try {
    const token = getToken();
    const res = await fetch(`/api${url}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401 && url !== '/login') {
      setToken(null);
      window.dispatchEvent(new Event('heatingpi:logout'));
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { error: new Error(json.error || `Request failed (${res.status})`) };
    return { data: json as T };
  } catch (e) {
    return { error: new Error(`Network error: ${(e as Error).message}`) };
  }
}

export const api = {
  login: (email: string, password: string) => request<{ token: string }>('POST', '/login', { email, password }),
  me: () => request<{ email: string }>('GET', '/me'),
  dashboard: () => request<Dashboard>('GET', '/dashboard'),
  pins: () => request<Pin[]>('GET', '/pins'),
  updatePin: (id: number, patch: Partial<Pick<Pin, 'name' | 'activeByDefault'>>) => request<Pin>('PATCH', `/pins/${id}`, patch),
  schemas: () => request<Schema[]>('GET', '/schemas'),
  addSchema: (s: Omit<Schema, 'id' | 'active' | 'running'>) => request<Schema>('POST', '/schemas', s),
  editSchema: (id: string, s: Omit<Schema, 'id' | 'active' | 'running'>) => request<Schema>('PUT', `/schemas/${id}`, s),
  deleteSchema: (id: string) => request<{ ok: true }>('DELETE', `/schemas/${id}`),
  activateSchema: (id: string, active: boolean) => request<Schema>('POST', `/schemas/${id}/active`, { active }),
  settings: () => request<Settings>('GET', '/settings'),
  saveSettings: (s: Partial<Settings>) => request<Settings>('PUT', '/settings', s),
  temperatureRecent: () => request<{ date: number; value: number }[]>('GET', '/temperature/recent'),
  temperatureStats: () => request<TemperatureStats>('GET', '/temperature/stats'),
  confirmExport: (until: number) => request<{ deleted: number }>('POST', '/temperature/export/confirm', { until }),
  mailNow: () => request<{ count: number; to?: string }>('POST', '/temperature/mail'),
};

/** Downloads the CSV, then tells the server to delete exactly the exported rows. */
export async function downloadAndDelete(): Promise<Result<{ count: number }>> {
  try {
    const res = await fetch('/api/temperature/export', { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) return { error: new Error(`Export failed (${res.status})`) };
    const until = Number(res.headers.get('X-Export-Until'));
    const count = Number(res.headers.get('X-Export-Count'));
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const d = new Date();
    a.download = `heatingpi-temperatures-${d.toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    if (count === 0) return { data: { count } };
    const { error } = await api.confirmExport(until);
    if (error) return { error };
    return { data: { count } };
  } catch (e) {
    return { error: e as Error };
  }
}
