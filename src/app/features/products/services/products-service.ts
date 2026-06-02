import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/types/api/api-response';
import { Product, SaveProductRequest } from '../types/product';
import { PaginatedResponse } from '../../../shared/types/api/paginated-response';
import { environment } from '../../../../environments/environment.development';
import { SearchParams } from '../../../shared/types/api/search-params';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);

  getProducts(params?: SearchParams): Observable<ApiResponse<PaginatedResponse<Product>>> {
    let httpParams = new HttpParams();
    if (params?.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.direction) httpParams = httpParams.set('direction', params.direction);

    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(
      `${environment.apiUrl}/products`,
      { params: httpParams },
    );
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`);
  }

  createProduct(data: SaveProductRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${environment.apiUrl}/products`, data);
  }

  updateProduct(id: number, data: SaveProductRequest): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/products/${id}`);
  }
}
