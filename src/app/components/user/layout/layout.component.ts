import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { CartService } from '../../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Badge } from 'primeng/badge';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterModule, BottomNavComponent, CommonModule, Badge],
  template: `
    <div class="user-layout">
      <header class="common-header" *ngIf="!hideHeader">
        <div class="header-left-section">
          <div class="logo-container">
            <i class="pi pi-bolt logo-icon"></i>
            <span class="logo-text">MotoMart</span>
          </div>
          <div class="header-divider"></div>
          <span class="header-tagline">Premium Moto Parts</span>
        </div>
        
        <div class="header-right-section">
          <a routerLink="/cart" class="cart-btn" aria-label="Shopping Cart">
            <i class="pi pi-shopping-cart cart-icon">
              <p-badge *ngIf="cartCount > 0" [value]="cartCount" severity="danger"></p-badge>
            </i>
          </a>
        </div>
      </header>
      <main class="user-content" [class.no-header]="hideHeader">
        <router-outlet></router-outlet>
      </main>
      <app-bottom-nav></app-bottom-nav>
    </div>
  `,
  styles: [`
    .user-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f8fafc;
    }
    .common-header {
      background: #ffffff;
      padding: 1rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid #f1f5f9;
      z-index: 10;
    }
    .header-left-section {
      display: flex;
      align-items: center;
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
    .header-right-section {
      display: flex;
      align-items: center;
    }
    .cart-btn {
      text-decoration: none;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .cart-btn:hover {
      background-color: #f1f5f9;
      color: #6366f1;
    }
    .cart-icon {
      font-size: 1.25rem;
      position: relative;
    }
    :host ::ng-deep .cart-icon .p-badge {
      position: absolute;
      top: -10px;
      right: -10px;
      min-width: 1.25rem;
      height: 1.25rem;
      line-height: 1.25rem;
    }
    .user-content {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 6rem;
    }
    .user-content.no-header {
      padding-top: 1rem;
    }
  `]
})
export class UserLayoutComponent implements OnInit {
  cartCount: number = 0;
  hideHeader: boolean = false;

  constructor(private cartService: CartService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Show header on all pages including account
      this.hideHeader = false;
    });
  }

  ngOnInit() {
    this.cartService.cartItems$.subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
    });
    this.cartService.loadCart();
  }
}
