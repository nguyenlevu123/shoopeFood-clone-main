const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean>
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(path, API_BASE_URL)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      payload?.error?.message ?? payload?.message ?? payload?.success?.message ?? `Request failed: ${response.status}`
    throw new Error(message)
  }

  return payload as T
}

export async function httpGet<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    method: 'GET',
    ...options,
  })
  return parseResponse<T>(response)
}

export async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

export async function httpPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

export async function httpDelete<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
  })
  return parseResponse<T>(response)
}

export async function httpPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}
