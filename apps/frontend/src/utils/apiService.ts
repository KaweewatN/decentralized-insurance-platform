import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

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

  // Generic GET request
  public async get<T>(
    url: string,
    params?: Record<string, any>,
    token?: string
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      params,
      ...this.getAuthConfig(token),
    };
    const response = await this.apiClient.get<T>(url, config);
    return response.data;
  }

  // Generic POST request
  public async post<T>(
    url: string,
    data?: Record<string, any>,
    token?: string
  ): Promise<T> {
    const config = this.getAuthConfig(token);
    const response = await this.apiClient.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  public async put<T>(
    url: string,
    data?: Record<string, any>,
    token?: string
  ): Promise<T> {
    const config = this.getAuthConfig(token);
    const response = await this.apiClient.put<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  public async delete<T>(url: string, token?: string): Promise<T> {
    const config = this.getAuthConfig(token);
    const response = await this.apiClient.delete<T>(url, config);
    return response.data;
  }
}

const apiService = new ApiService(
  process.env.API_BASE_URL || "http://localhost:3001/api"
);
export default apiService;
