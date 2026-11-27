export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type RequestOptions = Omit<RequestInit, 'method' | 'body'> & { body?: unknown };

const request = async <T>(
  method: string,
  url: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { body, headers, ...rest } = options;
  const response = await fetch(url, {
    ...rest,
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `${method} ${url} failed with ${response.status}`,
    );
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
};

// Shared methods for every service that talks to an HTTP API.
export const httpClient = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>('GET', url, options),
  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', url, { ...options, body }),
  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', url, { ...options, body }),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>('DELETE', url, options),
};
