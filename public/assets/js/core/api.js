/**
 * Minimal REST client. Sends the X-Requested-With header the server's CSRF guard
 * requires, uses same-origin cookies, and normalises error responses.
 */
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method, headers, signal, credentials: 'same-origin',
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('We couldn’t reach the server. Check your connection and try again.', 0);
  }
  let data = null;
  if (res.status !== 204) {
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  }
  if (!res.ok) {
    const e = data?.error || data || {};
    const fallback = res.status === 429 ? 'Too many requests. Please wait a moment and try again.' : 'Something went wrong. Please try again.';
    throw new ApiError(e.message || fallback, res.status, e.fields || {});
  }
  return data;
}

export const get = (p, o) => api(p, o);
export const post = (p, body) => api(p, { method: 'POST', body: body ?? {} });
