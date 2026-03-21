import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../services/order.service';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { PaginatorModule } from 'primeng/paginator';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, TagModule, TableModule, ButtonModule, DialogModule, StepsModule, PaginatorModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class UserOrdersComponent implements OnInit {
  orders: any[] = [];
  loading: boolean = true;
  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  
  displayTracking: boolean = false;
  displayDetails: boolean = false;
  trackingSteps: MenuItem[] = [];
  activeStep: number = 0;
  selectedOrder: any = null;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
    this.trackingSteps = [
      { label: 'Pending' },
      { label: 'Out for Delivery' },
      { label: 'Delivered' }
    ];
  }

  loadOrders(page: number = 1) {
    console.log('Fetching orders for page:', page);
    this.loading = true;
    this.currentPage = page;
    
    this.orderService.getUserOrders(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        try {
          console.log('Orders API response received:', res);
          
          if (Array.isArray(res)) {
            this.orders = res;
            this.totalCount = res.length;
          } else if (res) {
            // Check for both Items (PascalCase) and items (camelCase)
            this.orders = res.items || res.Items || [];
            this.totalCount = res.totalCount || res.TotalCount || this.orders.length;
          } else {
            this.orders = [];
            this.totalCount = 0;
          }
          
          console.log('Mapped orders:', this.orders);
        } catch (err) {
          console.error('Error processing orders response:', err);
          this.orders = [];
        } finally {
          this.loading = false;
          console.log('Loading state set to false');
        }
      },
      error: (err) => {
        console.error('API Error loading orders:', err);
        this.loading = false;
        this.orders = [];
      }
    });
  }

  onPageChange(event: any) {
    this.loadOrders(event.page + 1);
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
