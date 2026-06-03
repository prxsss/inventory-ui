import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, ButtonModule],
  templateUrl: './not-found-page.html',
})
export class NotFoundPage {}
