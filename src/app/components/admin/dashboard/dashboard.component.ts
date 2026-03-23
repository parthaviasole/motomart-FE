import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  };

  constructor(
    private dashboardService: DashboardService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
      }
    });
  }

  navigateTo(page: string) {
    this.router.navigate([`/admin/${page}`]);
  }
}
