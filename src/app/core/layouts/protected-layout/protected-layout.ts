import { Component, inject, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterLinkWithHref,
  RouterOutlet,
} from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-protected-layout',
  imports: [
    ButtonModule,
    RippleModule,
    TooltipModule,
    RouterOutlet,
    RouterLinkWithHref,
    RouterLinkActive,
    RouterLink,
  ],
  templateUrl: './protected-layout.html',
})
export class ProtectedLayout {
  isCollapsed = signal(false);
  private auth = inject(Auth);
  private router = inject(Router);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Products', icon: 'pi pi-box', routerLink: '/products' },
    { label: 'Categories', icon: 'pi pi-tag', routerLink: '/categories' },
    { label: 'Stocks', icon: 'pi pi-shopping-cart', routerLink: '/stocks' },
    { label: 'Reports', icon: 'pi pi-file-pdf', routerLink: '/reports' },
  ];

  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
