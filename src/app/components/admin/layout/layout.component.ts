import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, BottomNavComponent, CommonModule],
  template: `
    <div class="admin-layout">
      <!-- Desktop Sidebar -->
      <aside class="desktop-sidebar">
        <div class="sidebar-header">
          <div class="logo-container">
            <i class="pi pi-bolt logo-icon"></i>
            <span class="logo-text">MotoMart</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <i class="pi pi-home"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
            <i class="pi pi-box"></i>
            <span>Products</span>
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active" class="nav-item">
            <i class="pi pi-shopping-cart"></i>
            <span>Orders</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <i class="pi pi-users"></i>
            <span>Users</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <i class="pi pi-power-off"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div class="main-container">
        <header class="common-header">
          <div class="mobile-logo logo-container">
            <i class="pi pi-bolt logo-icon"></i>
            <span class="logo-text">MotoMart</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">{{ getPageTitle() }}</h1>
            <span class="header-tagline">Premium Moto Parts</span>
          </div>
        </header>

        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Bottom Nav -->
      <app-bottom-nav class="mobile-only"></app-bottom-nav>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      background-color: #f8fafc;
      overflow: hidden;
    }

    /* Desktop Sidebar */
    .desktop-sidebar {
      width: 260px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      z-index: 20;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.25rem;
      color: #6366f1;
      background: #f5f3ff;
      padding: 0.5rem;
      border-radius: 10px;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #64748b;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .nav-item i {
      font-size: 1.1rem;
    }

    .nav-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .nav-item.active {
      background: #6366f1;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: transparent;
      border: 1px solid #e2e8f0;
      color: #ef4444;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #fef2f2;
      border-color: #fecaca;
    }

    /* Main Container */
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .common-header {
      background: #ffffff;
      padding: 1.25rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      z-index: 10;
    }

    .mobile-logo {
      display: none;
    }

    .header-info {
      display: flex;
      flex-direction: column;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .header-tagline {
      font-size: 0.875rem;
      color: #64748b;
    }

    .admin-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    .mobile-only {
      display: none;
    }

    @media screen and (max-width: 768px) {
      .desktop-sidebar {
        display: none;
      }

      .mobile-logo {
        display: flex;
      }

      .common-header {
        padding: 1rem;
      }

      .header-info {
        display: none;
      }

      .admin-content {
        padding: 1rem;
        padding-bottom: 6rem;
      }

      .mobile-only {
        display: block;
      }
    }
  `]
})
export class AdminLayoutComponent {
  constructor(private router: Router) {}

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/products')) return 'Inventory Management';
    if (url.includes('/orders')) return 'Order Fulfillment';
    if (url.includes('/users')) return 'User Administration';
    return 'Admin Dashboard';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
