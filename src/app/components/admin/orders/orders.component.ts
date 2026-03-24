import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../services/order.service';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, DialogModule, InputTextModule, PaginatorModule, TooltipModule, SelectModule, ToastModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  providers: [MessageService]
})
export class AdminOrdersComponent implements OnInit {
  @ViewChild('dt') table!: Table;

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

  ngOnInit() {}

  loadOrders(event?: any) {
    if (event) {
      this.pageNumber = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
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
    setTimeout(() => {
      this.table.onLazyLoad.emit({
        first: 0,
        rows: this.pageSize
      });
    });
  }

  onStatusChange() {
    setTimeout(() => {
      this.table.onLazyLoad.emit({
        first: 0,
        rows: this.pageSize
      });
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    setTimeout(() => {
      this.table.onLazyLoad.emit({
        first: (page - 1) * this.pageSize,
        rows: this.pageSize
      });
    });
  }

  changePageSize(newSize: number) {
    this.pageSize = newSize;
    setTimeout(() => {
      this.table.onLazyLoad.emit({
        first: 0,
        rows: this.pageSize
      });
    });
  }

  viewDetails(order: any) {
    this.selectedOrder = order;
    this.displayDetailsDialog = true;
  }

  proceedToDelivery(orderId: string) {
    this.orderService.updateOrderStatus(orderId, 'Out for Delivery').subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order status updated. OTP sent to user.' });
      setTimeout(() => {
        this.table.onLazyLoad.emit({ first: (this.pageNumber - 1) * this.pageSize, rows: this.pageSize });
      });
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
        setTimeout(() => {
          this.table.onLazyLoad.emit({ first: (this.pageNumber - 1) * this.pageSize, rows: this.pageSize });
        });
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
