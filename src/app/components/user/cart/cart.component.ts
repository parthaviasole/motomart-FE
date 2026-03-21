import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../../services/cart.service';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-cart',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class UserCartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getCartTotal();
    });
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.cartService.removeFromCart(productId).subscribe();
    } else {
      this.cartService.updateQuantity(productId, quantity).subscribe();
    }
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId).subscribe();
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
