import { Component, computed, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
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
  currentPageName = signal('Dashboard');
  private auth = inject(Auth);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

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
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
