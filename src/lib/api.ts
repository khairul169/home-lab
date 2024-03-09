import { API_BASEURL } from "./constants";

export type APIParams = { [key: string]: any };

export type APIOptions = RequestInit & {
  params?: APIParams;
};

const api = async <T>(url: string, options: APIOptions = {}): Promise<T> => {
  const fullUrl = new URL(url, API_BASEURL);

  if (options.params && Object.keys(options.params).length > 0) {
    for (const [key, value] of Object.entries(options.params)) {
      fullUrl.searchParams.append(key, value);
    }
  }

  const response = await fetch(fullUrl.toString(), options);

  if (!response.ok) {
    throw new APIError(response);
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    const data = (await response.json()) as T;
    return data;
  }

  const data = await response.text();
  return data as T;
};

api.post = async <T>(url: string, body: any, options: APIOptions = {}) => {
  return api<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
};

api.patch = async <T>(url: string, body: any, options: APIOptions = {}) => {
  return api<T>(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });
};

api.put = async <T>(url: string, body: any, options: APIOptions = {}) => {
  return api<T>(url, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
};

api.delete = async <T>(url: string, options: APIOptions = {}) => {
  return api<T>(url, {
    method: "DELETE",
    ...options,
  });
};

export class APIError extends Error {
  res: Response;
  code: number;

  constructor(res: Response) {
    super(res.statusText);
    this.res = res;
    this.code = res.status;
  }
}

export default api;
