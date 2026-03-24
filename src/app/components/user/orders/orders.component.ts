import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../services/order.service';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule, TableModule, ButtonModule, DialogModule, StepsModule, PaginatorModule, InputTextModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class UserOrdersComponent implements OnInit {
  orders: any[] = [];
  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  
  searchTerm: string = '';
  activeStatus: string = 'Active';

  displayTracking: boolean = false;
  displayDetails: boolean = false;
  trackingSteps: MenuItem[] = [];
  activeStep: number = 0;
  selectedOrder: any = null;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.loadOrders();
    });
    
    this.trackingSteps = [
      { label: 'Pending' },
      { label: 'Out for Delivery' },
      { label: 'Delivered' }
    ];
  }

  loadOrders(page: number = 1) {
    this.currentPage = page;
    const status = this.activeStatus === 'Active' ? 'Pending,Out for Delivery' : 'Delivered';
    
    this.orderService.getUserOrders(this.currentPage, this.pageSize, this.searchTerm, undefined, status).subscribe({
      next: (res: any) => {
        this.orders = res.items || res.Items || [];
        this.totalCount = res.totalCount || res.TotalCount || this.orders.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error loading orders:', err);
        this.orders = [];
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.loadOrders();
  }

  filterByStatus(status: string) {
    this.activeStatus = status;
    this.loadOrders();
  }

  onPageChange(event: any) {
    this.currentPage = (event.page || 0) + 1;
    this.pageSize = event.rows || 10;
    this.loadOrders(this.currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trackOrder(order: any) {
    this.selectedOrder = order;
    const status = order.status || order.Status;
    
    if (status === 'Pending') this.activeStep = 0;
    else if (status === 'Out for Delivery') this.activeStep = 1;
    else if (status === 'Delivered') this.activeStep = 2;
    
    this.displayTracking = true;
  }

  viewDetails(order: any) {
    this.selectedOrder = order;
    this.displayDetails = true;
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
