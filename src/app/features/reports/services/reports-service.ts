import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../../shared/types/api/api-response';
import { PaginatedResponse } from '../../../shared/types/api/paginated-response';
import { LowStockProduct } from '../types/low-stock-product';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { SearchParams } from '../../../shared/types/api/search-params';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private http = inject(HttpClient);

  getLowStockProducts(
    params?: SearchParams,
  ): Observable<ApiResponse<PaginatedResponse<LowStockProduct>>> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);

    return this.http.get<ApiResponse<PaginatedResponse<LowStockProduct>>>(
      `${environment.apiUrl}/reports/low-stock`,
      { params: httpParams },
    );
  }
}
