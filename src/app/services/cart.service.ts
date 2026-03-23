import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Product } from './product.service';

export interface CartItem {
  id: string;
  userId: string;
  productId: number;
  quantity: number;
  product?: Product;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5237/api/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[] | null>(null);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  loadCart() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.cartItemsSubject.next([]);
      return;
    }

    this.http.get<CartItem[]>(this.apiUrl).subscribe({
      next: (items) => {
        console.log('Cart loaded successfully:', items);
        this.cartItemsSubject.next(items);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.cartItemsSubject.next([]);
      }
    });
  }

  addToCart(productId: number, quantity: number): Observable<CartItem> {
    return this.http.post<CartItem>(this.apiUrl, { productId, quantity }).pipe(
      tap(() => this.loadCart())
    );
  }

  updateQuantity(productId: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/${productId}`, quantity).pipe(
      tap(() => this.loadCart())
    );
  }

  removeFromCart(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => this.cartItemsSubject.next([]))
    );
  }

  getCartCount(): number {
    const items = this.cartItemsSubject.value;
    return items ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  }

  getCartTotal(): number {
    const items = this.cartItemsSubject.value;
    return items ? items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) : 0;
  }
}
