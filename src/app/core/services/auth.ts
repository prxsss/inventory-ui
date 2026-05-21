import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../shared/models/api/api-response';
import { AuthResponse } from '../../shared/models/auth/auth-response';
import { LoginRequest } from '../../shared/models/auth/login-request';
import { RegisterRequest } from '../../shared/models/auth/register-request';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  login(payload: LoginRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, payload);
  }

  register(payload: RegisterRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/register`,
      payload,
    );
  }

  logout() {
    localStorage.removeItem('token');
  }
}
