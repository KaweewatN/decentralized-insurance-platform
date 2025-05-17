import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const DEFAULT_BACKEND_PORT = 3001;
export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${DEFAULT_BACKEND_PORT}/api`
    : "https://warehouse-inventory-app-backend.vercel.app/api";

class ApiService {
  private apiClient: AxiosInstance;

  constructor(baseURL: string) {
    this.apiClient = axios.create({
      baseURL,
      timeout: 10000,
    });
  }

  // Helper to add Bearer token if provided
  private getAuthConfig(token?: string): AxiosRequestConfig {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  public async get<T>(url: string, accessToken?: string): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          ...(this.getAuthConfig(accessToken).headers || {}),
        },
      };
      const response = await this.apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic POST request
  public async post<T>(
    url: string,
    data?: Record<string, any>,
    accessToken?: string
  ): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          ...(this.getAuthConfig(accessToken).headers || {}),
        },
      };
      const response = await this.apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic PUT request
  public async put<T>(
    url: string,
    data?: Record<string, any>,
    accessToken?: string
  ): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          ...(this.getAuthConfig(accessToken).headers || {}),
        },
      };
      const response = await this.apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic DELETE request
  public async delete<T>(url: string, accessToken?: string): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          ...(this.getAuthConfig(accessToken).headers || {}),
        },
      };
      const response = await this.apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const apiService = new ApiService(API_BASE_URL);
export default apiService;
