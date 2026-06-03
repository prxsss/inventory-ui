import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  setUserName(name: string): void {
    localStorage.setItem('userName', name);
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  setUserEmail(email: string): void {
    localStorage.setItem('userEmail', email);
  }

  clearAll(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  }
}
