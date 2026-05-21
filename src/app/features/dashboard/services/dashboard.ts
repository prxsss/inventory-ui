import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../../shared/models/api/api-response';
import { InventorySummary } from '../../../shared/models/dashboard/inventory-summary';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private http = inject(HttpClient);

  getSummary() {
    return this.http.get<ApiResponse<InventorySummary>>(`${environment.apiUrl}/reports/summary`);
  }
}
