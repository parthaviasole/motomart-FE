import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../services/order.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, DialogModule, InputTextModule, PaginatorModule, TooltipModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  totalCount: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;
  
  displayOtpDialog: boolean = false;
  displayDetailsDialog: boolean = false;
  selectedOrderId: string = '';
  selectedOrder: any = null;
  otpInput: string = '';

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Fix: ExpressionChangedAfterItHasBeenCheckedError by using setTimeout
    setTimeout(() => {
      this.loadOrders();
    });
  }

  loadOrders() {
    console.log('Admin: Fetching all orders for page:', this.pageNumber);
    this.orderService.getAllOrders(this.pageNumber, this.pageSize).subscribe({
      next: (result: any) => {
        try {
          console.log('Admin: API response received:', result);
          if (Array.isArray(result)) {
            this.orders = result;
            this.totalCount = result.length;
          } else if (result && (result.items || result.Items)) {
            this.orders = result.items || result.Items || [];
            this.totalCount = result.totalCount || result.TotalCount || 0;
          } else {
            console.warn('Admin: Unexpected API response structure:', result);
            this.orders = [];
            this.totalCount = 0;
          }
          console.log('Admin: Mapped orders:', this.orders);
        } catch (err) {
          console.error('Admin: Error processing response:', err);
          this.orders = [];
        } finally {
          this.cdr.detectChanges();
          console.log('Admin: Orders processed');
        }
      },
      error: (err) => {
        console.error('Admin: API Error loading orders', err);
        this.orders = [];
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: any) {
    this.pageNumber = (event.page || 0) + 1;
    this.pageSize = event.rows || 10;
    this.loadOrders();
  }

  viewDetails(order: any) {
    this.selectedOrder = order;
    this.displayDetailsDialog = true;
  }

  proceedToDelivery(orderId: string) {
    this.orderService.updateOrderStatus(orderId, 'Out for Delivery').subscribe(() => {
      alert('Order status updated. OTP sent to user.');
      this.loadOrders();
    });
  }

  openOtpDialog(orderId: string) {
    this.selectedOrderId = orderId;
    this.otpInput = '';
    this.displayOtpDialog = true;
  }

  verifyOtp() {
    this.orderService.verifyOtp(this.selectedOrderId, this.otpInput).subscribe({
      next: () => {
        alert('OTP Verified! Order marked as Delivered.');
        this.displayOtpDialog = false;
        this.loadOrders();
      },
      error: (err) => {
        alert('Invalid OTP. Please try again or resend OTP.');
      }
    });
  }

  resendOtp() {
    this.orderService.resendOtp(this.selectedOrderId).subscribe(() => {
      alert('New OTP sent to user email.');
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Out for Delivery': return 'warn';
      case 'Pending': return 'info';
      default: return 'secondary';
    }
  }
}
