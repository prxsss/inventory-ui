import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [InputTextModule, PasswordModule, ButtonModule, RouterLink],
  templateUrl: './login-page.html',
})
export class LoginPage {}
