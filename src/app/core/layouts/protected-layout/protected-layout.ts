import { Component, inject, OnInit, signal } from '@angular/core';
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
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs';

import { TokenService } from '../../auth/token-service';
import { AuthService } from '../../../features/auth/services/auth-service';
import { UserProfile } from '../../../features/auth/types/user-profile';

@Component({
  selector: 'app-protected-layout',
  imports: [
    ButtonModule,
    AvatarModule,
    RippleModule,
    TooltipModule,
    RouterOutlet,
    RouterLinkWithHref,
    RouterLinkActive,
    RouterLink,
  ],
  templateUrl: './protected-layout.html',
})
export class ProtectedLayout implements OnInit {
  isCollapsed = signal(false);
  currentPageName = signal('Dashboard');
  profile = signal<UserProfile | null>(null);
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
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
    { label: 'Reports', icon: 'pi pi-chart-bar', routerLink: '/reports' },
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

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.profile.set(response.data);
          this.tokenService.setUserName(response.data.name);
          this.tokenService.setUserEmail(response.data.email);
        }
      },
    });
  }

  logout() {
    this.tokenService.clearAll();
    this.router.navigate(['/auth/login']);
  }
}
