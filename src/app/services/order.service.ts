import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, PagedResult } from './product.service';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  totalAmount: number;
  status: string;
  paymentType: string;
  otp?: string;
  createdAt: string;
  orderItems: OrderItem[];
  user?: any;
  address?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5237/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(addressId: string, paymentType: string, items: { productId: number, quantity: number }[]): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, { addressId, paymentType, items });
  }

  getUserOrders(pageNumber: number = 1, pageSize: number = 10, searchTerm?: string, date?: string, status?: string): Observable<PagedResult<Order>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (date) params = params.set('date', date);
    if (status) params = params.set('status', status);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/user`, { params });
  }

  getAllOrders(pageNumber: number = 1, pageSize: number = 10, searchTerm?: string, date?: string, status?: string): Observable<PagedResult<Order>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (date) params = params.set('date', date);
    if (status) params = params.set('status', status);

    return this.http.get<PagedResult<Order>>(this.apiUrl, { params });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  verifyOtp(id: string, otp: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/verify-otp`, `"${otp}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  resendOtp(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/resend-otp`, {});
  }
}
