import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.css'
})
export class BottomNavComponent {
  navLinks = [
    { path: '/admin', icon: 'pi pi-home', label: 'Home' },
    { path: '/admin/products', icon: 'pi pi-box', label: 'Products' },
    { path: '/admin/orders', icon: 'pi pi-shopping-cart', label: 'Orders' },
    { path: '/admin/users', icon: 'pi pi-users', label: 'Users' }
  ];
}
