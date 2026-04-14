const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const MORTGAGE_API_URL = process.env.NEXT_PUBLIC_MORTGAGE_API_URL || 'http://localhost:8000';

async function request(endpoint: string, options: RequestInit = {}, baseUrl: string = API_URL) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('saas_token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authService = {
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData: any) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const userService = {
  getProfile: () => request('/users/profile'),
  getAllUsers: () => request('/users/all'),
  createUser: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),
};

export const subscriptionService = {
  update: (data: any) => request('/subscriptions/update', { method: 'POST', body: JSON.stringify(data) }),
};

export const departmentService = {
  getDepartments: () => request('/teams'),
  createDepartment: (data: any) => request('/teams', { method: 'POST', body: JSON.stringify(data) }),
  addMember: (deptId: string, data: any) => request(`/teams/${deptId}/members`, { method: 'POST', body: JSON.stringify(data) }),
  removeMember: (deptId: string, userId: string) => request(`/teams/${deptId}/members/${userId}`, { method: 'DELETE' }),
};

export const roleService = {
  getRoles: () => request('/roles'),
  createRole: (data: any) => request('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: any) => request(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id: string) => request(`/roles/${id}`, { method: 'DELETE' }),
};

export const notificationService = {
  getNotifications: () => request('/notifications'),
  markAsRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  delete: (id: string) => request(`/notifications/${id}`, { method: 'DELETE' }),
};

export const mortgageService = {
  analyze: (data: any) => request('/analyze', { method: 'POST', body: JSON.stringify(data) }, MORTGAGE_API_URL),
  simulate: (data: any) => request('/simulate', { method: 'POST', body: JSON.stringify(data) }, MORTGAGE_API_URL),
  ask: (query: string, user_id?: string) => request('/ask', { method: 'POST', body: JSON.stringify({ query, user_id }) }, MORTGAGE_API_URL),
  downloadReport: async (data: any): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('saas_token') : null;
    const response = await fetch(`${MORTGAGE_API_URL}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to generate report');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'underwriting_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  },
};
