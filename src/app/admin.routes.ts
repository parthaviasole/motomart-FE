import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin/layout/layout.component';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AdminProductsComponent } from './components/admin/products/products.component';
import { AdminOrdersComponent } from './components/admin/orders/orders.component';
import { AdminUsersComponent } from './components/admin/users/users.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'users', component: AdminUsersComponent }
    ]
  }
];
