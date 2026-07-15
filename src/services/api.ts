// src/services/api.ts

import axios, {
  AxiosError,
  AxiosInstance,
} from 'axios';

declare global {
  interface Window {
    __SERVEASE_API_URL__?: string;
  }
}

const DEFAULT_API_URL =
  'http://localhost:5001';

/*
 * You can optionally set this before the React application loads:
 *
 * window.__SERVEASE_API_URL__ =
 *   'https://your-backend.example.com';
 */
export const API_BASE_URL = (
  window.__SERVEASE_API_URL__ ||
  DEFAULT_API_URL
).replace(/\/+$/, '');

export const resolveApiAssetUrl = (
  assetUrl: string
): string => {
  if (!assetUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(assetUrl)) {
    return assetUrl;
  }

  return new URL(
    assetUrl,
    `${API_BASE_URL}/`
  ).toString();
};

const api: AxiosInstance =
  axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

/*
 * Do not set Content-Type globally.
 *
 * Axios will automatically use:
 * - application/json for ordinary objects
 * - multipart/form-data for FormData uploads
 */
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'servease_token'
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    const isUnauthorized =
      error.response?.status === 401;

    const isLoginRequest =
      error.config?.url?.includes(
        '/auth/login'
      ) ||
      error.config?.url?.includes(
        'auth/login'
      );

    if (
      isUnauthorized &&
      !isLoginRequest
    ) {
      localStorage.removeItem(
        'servease_token'
      );

      localStorage.removeItem(
        'servease_user'
      );

      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export interface LoginApiResponse {
  message: string;

  token: string;

  employee: {
    employeeId: string;
    fullName: string;
    username: string;
    emailAddress: string;
    assignedRole: string;
    assignedDepartment?: string;
    isActive?: boolean;
  };
}

export interface RegisterEmployeePayload {
  fullName: string;
  emailAddress: string;
  assignedRole: string;
  assignedDepartment: string;
  password: string;
  confirmPassword?: string;
  baseSalary?: number;
  allowances?: number;
  deductions?: number;
}

export interface EmployeeResponse {
  employeeId: string;
  fullName: string;
  username: string;
  emailAddress: string;
  assignedRole: string;
  assignedDepartment?: string;
  isActive?: boolean;
  managerId?: string | null;
  teamId?: string | null;
}

export const authService = {
  login: async (
    username: string,
    password: string
  ): Promise<LoginApiResponse> => {
    const response =
      await api.post<LoginApiResponse>(
        '/auth/login',
        {
          username,
          password,
        }
      );

    return response.data;
  },

  register: async (
    userData: RegisterEmployeePayload
  ): Promise<unknown> => {
    const response = await api.post(
      '/employees/register',
      userData
    );

    return response.data;
  },

  logout: async (): Promise<void> => {
    const token =
      localStorage.getItem(
        'servease_token'
      );

    if (token) {
      try {
        await api.post(
          '/auth/logout'
        );
      } catch (error) {
        console.error(
          'Logout API error:',
          error
        );
      }
    }

    localStorage.removeItem(
      'servease_token'
    );

    localStorage.removeItem(
      'servease_user'
    );
  },

  getCurrentUser:
    async (): Promise<EmployeeResponse> => {
      const response =
        await api.get<EmployeeResponse>(
          '/employees/profile'
        );

      return response.data;
    },
};

export const userService = {
  getAll:
    async (): Promise<EmployeeResponse[]> => {
      const response =
        await api.get<
          | EmployeeResponse[]
          | {
              employees: EmployeeResponse[];
            }
        >('/employees');

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return response.data.employees;
    },

  getById: async (
    id: string
  ): Promise<EmployeeResponse> => {
    const response =
      await api.get<EmployeeResponse>(
        `/employees/${id}`
      );

    return response.data;
  },

  create: async (
    userData: RegisterEmployeePayload
  ): Promise<EmployeeResponse> => {
    const response =
      await api.post<EmployeeResponse>(
        '/employees',
        userData
      );

    return response.data;
  },

  update: async (
    id: string,
    userData: Partial<RegisterEmployeePayload>
  ): Promise<EmployeeResponse> => {
    const response =
      await api.put<EmployeeResponse>(
        `/employees/${id}`,
        userData
      );

    return response.data;
  },

  delete: async (
    id: string
  ): Promise<void> => {
    await api.delete(
      `/employees/${id}`
    );
  },
};

export default api;