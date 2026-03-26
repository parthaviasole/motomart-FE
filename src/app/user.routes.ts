import { Routes } from '@angular/router';
import { UserLayoutComponent } from './components/user/layout/layout.component';
import { UserHomeComponent } from './components/user/home/home.component';
import { UserProductsComponent } from './components/user/products/products.component';
import { UserOrdersComponent } from './components/user/orders/orders.component';
import { UserCartComponent } from './components/user/cart/cart.component';
import { UserCheckoutComponent } from './components/user/checkout/checkout.component';
import { UserAccountComponent } from './components/user/account/account.component';
import { AddressBookComponent } from './components/user/address-book/address-book.component';

import { AuthGuard } from './auth.guard';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: UserHomeComponent },
      { path: 'products', component: UserProductsComponent },
      { path: 'cart', component: UserCartComponent },
      { path: 'checkout', component: UserCheckoutComponent },
      { path: 'orders', component: UserOrdersComponent },
      { path: 'account', component: UserAccountComponent },
      { path: 'address-book', component: AddressBookComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
