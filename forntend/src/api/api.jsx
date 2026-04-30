const API_BASE_URL = 'https://team-task-manager-y916.onrender.com';

const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (response.status === 401) {
    localStorage.removeItem('token');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || 'Request failed.');
    error.response = { status: response.status, data: payload };
    throw error;
  }

  return { data: payload };
};

const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),
  patch: (path, body) =>
    request(path, {
      method: 'PATCH',
      body: JSON.stringify(body || {}),
    }),
  delete: (path) =>
    request(path, {
      method: 'DELETE',
    }),
};

export default api;
