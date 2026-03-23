import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private cartService: CartService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchCart();
  }

  fetchCart() {
    this.cartService.getCart().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.total = this.calculateTotal(items);
        console.log('Cart fetched successfully in component:', items);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching cart in component:', err);
      }
    });
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.cartService.updateQuantity(productId, quantity).subscribe({
        next: () => this.fetchCart()
      });
    }
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => this.fetchCart()
    });
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
