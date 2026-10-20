const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export type Incident = {
  id: string;
  title: string;
  description: string;
  status: 'NUEVO' | 'ASIGNADO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  category: { id: string; name: string };
  reporter: { id: string; name: string };
  technician: { id: string; name: string } | null;
};

export type IncidentComment = {
  id: string;
  incidentId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; role: string };
};

export type User = { id: string; name: string; role: string };

export type IncidentFilters = {
  status?: Incident['status'];
  priority?: Incident['priority'];
  categoryId?: string;
  technicianId?: string;
};

export type Pagination = { page: number; limit: number; total: number; totalPages: number };
export type Catalogs = {
  categories: { id: string; name: string }[];
  technicians: { id: string; name: string }[];
};

type ApiErrorBody = { error?: { message?: string } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    throw new Error('No se pudo conectar con el servicio. Intenta nuevamente.');
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(body.error?.message ?? `La solicitud falló (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function fetchIncidents(
  filters: IncidentFilters & { page: number; limit: number },
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return request<{ data: Incident[]; meta: Pagination }>(`/incidents?${params}`, { signal });
}

export async function fetchCatalogs(signal?: AbortSignal) {
  const result = await request<{ data: Catalogs }>('/catalogs', { signal });
  return result.data;
}

export async function fetchComments(incidentId: string, signal?: AbortSignal) {
  const result = await request<{ data: IncidentComment[] }>(
    `/incidents/${encodeURIComponent(incidentId)}/comments?limit=100`,
    { signal },
  );
  return result.data;
}

export async function postComment(incidentId: string, authorId: string, content: string) {
  const result = await request<{ data: IncidentComment }>(
    `/incidents/${encodeURIComponent(incidentId)}/comments`,
    { method: 'POST', body: JSON.stringify({ authorId, content }) },
  );
  return result.data;
}

export const demoUsers: User[] = [
  { id: '00000000-0000-4000-8000-000000000001', name: 'Usuario Solicitante', role: 'REQUESTER' },
  { id: '00000000-0000-4000-8000-000000000002', name: 'Técnico de Soporte', role: 'TECHNICIAN' },
  { id: '00000000-0000-4000-8000-000000000003', name: 'Administrador', role: 'ADMIN' },
];
