const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://medikiosk-5nyv.onrender.com/api');

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('arogya_token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Don't auto-redirect if we're attempting login
      if (!endpoint.includes('/auth/login')) {
        localStorage.removeItem('arogya_token');
        localStorage.removeItem('arogya_user');
      }
    }

    if (!response.ok) {
      let errMessage = `Error ${response.status}: ${response.statusText}`;
      let errData = null;
      try {
        errData = await response.json();
        if (errData && errData.detail) {
          errMessage = Array.isArray(errData.detail) 
            ? errData.detail.map((e: any) => e.msg || e).join(', ')
            : errData.detail;
        }
      } catch {
        // Non-JSON response
      }
      throw new ApiError(errMessage, response.status, errData);
    }

    // Return empty json object for 204 or empty bodies
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network connection failed. Please ensure backend is running.', 0);
  }
}

export { API_BASE };
