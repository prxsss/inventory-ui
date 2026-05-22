import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../../shared/types/api/api-response';
import { InventorySummary } from '../types/inventory-summary';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  getSummary() {
    return this.http.get<ApiResponse<InventorySummary>>(`${environment.apiUrl}/reports/summary`);
  }
}
