import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';

import { Auth } from '../../../../core/services/auth';
import { ApiErrorResponse } from '../../../../shared/models/api/api-response';
import { LoginRequest } from '../../../../shared/models/auth/login-request';

@Component({
  selector: 'app-login-page',
  imports: [
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule,
    MessageModule,
  ],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private auth = inject(Auth);
  private router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  isFormSubmitted = signal(false);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  onSubmit() {
    this.isFormSubmitted.set(true);
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    const payload: LoginRequest = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };

    this.auth.login(payload).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);

        localStorage.setItem('token', response.data.token);

        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (httpError: HttpErrorResponse) => {
        const apiError = httpError.error as ApiErrorResponse;

        console.error('Login failed:', httpError);

        if (apiError?.error?.message) {
          this.errorMessage.set(apiError.error.message);
        } else {
          this.errorMessage.set('An unexpected error occurred. Please try again.');
        }

        this.isLoading.set(false);
      },
    });
  }
}
