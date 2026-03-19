import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.css'
})
export class BottomNavComponent implements OnInit {
  navLinks: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const role = this.authService.getUserRole();
    if (role === 'Admin') {
      this.navLinks = [
        { path: '/admin', icon: 'pi pi-home', label: 'Home' },
        { path: '/admin/products', icon: 'pi pi-box', label: 'Products' },
        { path: '/admin/orders', icon: 'pi pi-shopping-cart', label: 'Orders' },
        { path: '/admin/users', icon: 'pi pi-users', label: 'Users' }
      ];
    } else {
      this.navLinks = [
        { path: '/dashboard', icon: 'pi pi-home', label: 'Home' },
        { path: '/products', icon: 'pi pi-box', label: 'Products' },
        { path: '/orders', icon: 'pi pi-shopping-cart', label: 'Orders' },
        { path: '/account', icon: 'pi pi-user', label: 'Account' }
      ];
    }
  }
}
