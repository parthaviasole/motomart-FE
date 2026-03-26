import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../services/order.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule, ButtonModule, DialogModule, InputTextModule, TooltipModule, SelectModule, ToastModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  providers: [MessageService]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  totalCount: number = 0;
  totalPages: number = 0;
  pagesArray: number[] = [];
  pageSize: number = 10;
  pageNumber: number = 1;
  searchTerm: string = '';
  selectedStatus: string = '';
  
  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Out for Delivery', value: 'Out for Delivery' },
    { label: 'Delivered', value: 'Delivered' }
  ];
  
  displayOtpDialog: boolean = false;
  displayDetailsDialog: boolean = false;
  selectedOrderId: string = '';
  selectedOrder: any = null;
  otpInput: string = '';

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadOrders(null);
  }

  loadOrders(event?: any) {
    if (event) {
      this.pageNumber = Math.floor((event.first || 0) / (event.rows || this.pageSize)) + 1;
      this.pageSize = event.rows || this.pageSize;
    }

    this.orderService.getAllOrders(this.pageNumber, this.pageSize, this.searchTerm, undefined, this.selectedStatus).subscribe({
      next: (result: any) => {
        // Use setTimeout to ensure change detection runs after the check
        setTimeout(() => {
          this.orders = result.items || result.Items || [];
          this.totalCount = result.totalCount || result.TotalCount || 0;
          this.totalPages = result.totalPages || result.TotalPages || 0;
          this.updatePagesArray();
          this.cdr.markForCheck(); // markForCheck is safer for async updates
        });
      },
      error: (err) => {
        console.error('Admin: API Error loading orders', err);
        setTimeout(() => {
          this.orders = [];
          this.cdr.markForCheck();
        });
      }
    });
  }

  updatePagesArray() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    this.pagesArray = pages;
  }

  onSearchChange() {
    this.pageNumber = 1;
    this.loadOrders(null);
  }

  onStatusChange() {
    this.pageNumber = 1;
    this.loadOrders(null);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadOrders(null);
  }

  changePageSize(newSize: number) {
    this.pageSize = newSize;
    this.pageNumber = 1;
    this.loadOrders(null);
  }

  viewDetails(order: any) {
    this.selectedOrder = order;
    this.displayDetailsDialog = true;
  }

  proceedToDelivery(orderId: string) {
    this.orderService.updateOrderStatus(orderId, 'Out for Delivery').subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order status updated. OTP sent to user.' });
      this.loadOrders(null);
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
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'OTP Verified! Order marked as Delivered.' });
        this.displayOtpDialog = false;
        this.loadOrders(null);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid OTP. Please try again or resend OTP.' });
      }
    });
  }

  resendOtp() {
    this.orderService.resendOtp(this.selectedOrderId).subscribe(() => {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'New OTP sent to user email.' });
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
