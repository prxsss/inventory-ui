import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../shared/types/api/api-response';
import { PaginatedResponse } from '../../../shared/types/api/paginated-response';
import { SearchParams } from '../../../shared/types/api/search-params';
import { Category, SaveCategoryRequest } from '../types/category';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private http = inject(HttpClient);

  getCategories(params?: SearchParams): Observable<ApiResponse<PaginatedResponse<Category>>> {
    let httpParams = new HttpParams();
    if (params?.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);

    return this.http.get<ApiResponse<PaginatedResponse<Category>>>(
      `${environment.apiUrl}/categories`,
      { params: httpParams },
    );
  }

  getCategory(id: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${environment.apiUrl}/categories/${id}`);
  }

  createCategory(data: SaveCategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${environment.apiUrl}/categories`, data);
  }

  updateCategory(id: string, data: SaveCategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${environment.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/categories/${id}`);
  }
}
