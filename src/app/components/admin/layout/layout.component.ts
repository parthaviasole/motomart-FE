import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, BottomNavComponent],
  template: `
    <div class="admin-layout">
      <header class="common-header">
        <div class="logo-container">
          <i class="pi pi-bolt logo-icon"></i>
          <span class="logo-text">MotoMart</span>
        </div>
        <div class="header-divider"></div>
        <span class="header-tagline">Premium Moto Parts</span>
      </header>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
      <app-bottom-nav></app-bottom-nav>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f8fafc;
    }
    .common-header {
      background: #ffffff;
      padding: 1.25rem 1rem;
      display: flex;
      align-items: center;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid #f1f5f9;
      z-index: 10;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-icon {
      font-size: 1.5rem;
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
    .header-divider {
      width: 1px;
      height: 24px;
      background: #e2e8f0;
      margin: 0 1.5rem;
    }
    .header-tagline {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      letter-spacing: 0.025em;
    }
    .admin-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      padding-bottom: 6rem;
    }
    @media screen and (max-width: 768px) {
      .admin-content {
        padding: 1rem;
        padding-bottom: 6rem;
      }
      .common-header {
        padding: 1rem;
      }
      .header-tagline {
        display: none;
      }
      .header-divider {
        display: none;
      }
    }
  `]
})
export class AdminLayoutComponent {}
