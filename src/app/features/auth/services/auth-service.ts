import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../../shared/types/api/api-response';
import { AuthResponse } from '../types/auth-response';
import { LoginRequest } from '../types/login-request';
import { RegisterRequest } from '../types/register-request';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(payload: LoginRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, payload);
  }

  register(payload: RegisterRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/register`,
      payload,
    );
  }
}
