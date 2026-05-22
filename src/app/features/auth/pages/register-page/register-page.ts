import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../services/auth-service';
import { TokenService } from '../../../../core/auth/token-service';
import { ApiErrorResponse } from '../../../../shared/types/api/api-response';
import { RegisterRequest } from '../../types/register-request';

@Component({
  selector: 'app-register-page',
  imports: [
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule,
    MessageModule,
  ],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private router = inject(Router);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  isFormSubmitted = signal(false);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  onSubmit() {
    this.isFormSubmitted.set(true);
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    const payload: RegisterRequest = {
      name: this.registerForm.value.name!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);

        this.tokenService.setToken(response.data.token);

        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (httpError: HttpErrorResponse) => {
        const apiError = httpError.error as ApiErrorResponse;

        console.error('Registration failed:', httpError);

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
