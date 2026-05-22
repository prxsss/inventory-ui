import { Component, inject, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterLinkWithHref,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs';

import { TokenService } from '../../auth/token-service';

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
  currentPageName = signal('Dashboard');
  private tokenService = inject(TokenService);
  private router = inject(Router);

  private pageNameMap: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/products': 'Products',
    '/categories': 'Categories',
    '/stocks': 'Stocks',
    '/reports': 'Reports',
  };

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Products', icon: 'pi pi-box', routerLink: '/products' },
    { label: 'Categories', icon: 'pi pi-tag', routerLink: '/categories' },
    { label: 'Stocks', icon: 'pi pi-shopping-cart', routerLink: '/stocks' },
    { label: 'Reports', icon: 'pi pi-file-pdf', routerLink: '/reports' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const pageName = this.pageNameMap[event.url] || 'Dashboard';
        this.currentPageName.set(pageName);
      });
  }

  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  logout() {
    this.tokenService.removeToken();
    this.router.navigate(['/auth/login']);
  }
}
