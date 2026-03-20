import { Routes } from '@angular/router';
import { UserLayoutComponent } from './components/user/layout/layout.component';
import { UserHomeComponent } from './components/user/home/home.component';
import { UserProductsComponent } from './components/user/products/products.component';
import { UserOrdersComponent } from './components/user/orders/orders.component';
import { UserAccountComponent } from './components/user/account/account.component';
import { AddressBookComponent } from './components/user/address-book/address-book.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'dashboard', component: UserHomeComponent },
      { path: 'products', component: UserProductsComponent },
      { path: 'orders', component: UserOrdersComponent },
      { path: 'account', component: UserAccountComponent },
      { path: 'address-book', component: AddressBookComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
