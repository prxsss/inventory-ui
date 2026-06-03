import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-reports-page',
  imports: [CardModule, ButtonModule, RouterLink],
  templateUrl: './reports-page.html',
})
export class ReportsPage {}
