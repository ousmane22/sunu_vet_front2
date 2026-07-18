import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './super-admin-layout.component.html',
})
export class SuperAdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  user = this.authService.currentUser;
  userMenuOpen = signal(false);
  sidebarOpen = signal(true);
  isMobile = signal(false);

  constructor() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile()) {
        this.sidebarOpen.set(false);
      }
    });
  }

  private checkMobile(): void {
    const wasMobile = this.isMobile();
    const nowMobile = window.innerWidth < 768;
    this.isMobile.set(nowMobile);
    
    if (!wasMobile && nowMobile) {
      this.sidebarOpen.set(false);
    }
    if (wasMobile && !nowMobile) {
      this.sidebarOpen.set(true);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout().subscribe();
  }
}




