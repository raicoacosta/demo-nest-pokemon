export interface AxiosAdapter {
  get<T>(url: string): Promise<T>;
}
