// Handles all communication with the backend for authentication.
// Use Vite proxy (/api) to avoid CORS & port coupling.
const API_URL = "/api/auth";

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    credentials: 'include',
    ...options,
  });

  const text = await response.text();
  const hasBody = text && text.trim().length > 0;
  let data = null;
  if (hasBody) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON from server (${response.status})`);
    }
  }

  if (!response.ok) {
    const message = data?.message || (hasBody ? text : `HTTP ${response.status}`);
    throw new Error(message);
  }

  return data;
}

export const loginApi = async (credentials) => {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return data?.user ?? data;
};

export const registerApi = async (userData) => {
  const data = await request('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return data?.user ?? data;
};

export const logoutApi = async () => {
  // backend exposes GET /api/auth/user/logout which clears the cookie
  await request('/user/logout', {
    method: 'GET',
  });
  return true;
};