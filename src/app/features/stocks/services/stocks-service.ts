import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SearchParams } from '../../../shared/types/api/search-params';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/types/api/api-response';
import { PaginatedResponse } from '../../../shared/types/api/paginated-response';
import { CreateStockTransactionRequest, StockTransaction } from '../types/stock-transaction';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class StocksService {
  private http = inject(HttpClient);

  getHistory(params?: SearchParams): Observable<ApiResponse<PaginatedResponse<StockTransaction>>> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);

    return this.http.get<ApiResponse<PaginatedResponse<StockTransaction>>>(
      `${environment.apiUrl}/stocks/history`,
      { params: httpParams },
    );
  }

  stockIn(request: CreateStockTransactionRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/stocks/in`, request);
  }

  stockOut(request: CreateStockTransactionRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/stocks/out`, request);
  }
}
