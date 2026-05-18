export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements?: number;
  number?: number;
}

export interface AuthenticatedRequestContext {
  token: string;
  signal?: AbortSignal;
}
