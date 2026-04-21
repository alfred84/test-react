export interface ApiResponse<T> {
  readonly data: T;
  readonly message?: string;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}
