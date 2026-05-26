import { Pagination } from './pagination';

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}
