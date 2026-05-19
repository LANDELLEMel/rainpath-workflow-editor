import type {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  Workflow,
  WorkflowSummary,
} from '../types/workflow';

const API_BASE_URL = 'http://localhost:3000';

class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function fetchWorkflows(): Promise<WorkflowSummary[]> {
  return request<WorkflowSummary[]>('/api/workflows');
}

export function fetchWorkflow(id: string): Promise<Workflow> {
  return request<Workflow>(`/api/workflows/${id}`);
}

export function createWorkflow(
  input: CreateWorkflowInput,
): Promise<Workflow> {
  return request<Workflow>('/api/workflows', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateWorkflow(
  id: string,
  input: UpdateWorkflowInput,
): Promise<Workflow> {
  return request<Workflow>(`/api/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteWorkflow(
  id: string,
): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(`/api/workflows/${id}`, {
    method: 'DELETE',
  });
}

export { ApiError, API_BASE_URL };
