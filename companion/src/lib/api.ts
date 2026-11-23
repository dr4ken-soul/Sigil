/** Backend base. No secret is ever placed here. */
export const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'

/** GET JSON from the backend with a clear failure path. */
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${backend}${path}`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`BACKEND_${response.status}`)
  return response.json() as Promise<T>
}

/** POST JSON to the backend. */
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${backend}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`BACKEND_${response.status}`)
  return response.json() as Promise<T>
}

/** PUT JSON to the backend. */
export async function putJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${backend}${path}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`BACKEND_${response.status}`)
  return response.json() as Promise<T>
}
