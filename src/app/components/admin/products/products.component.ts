import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService, PagedResult } from '../../../services/product.service';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class AdminProductsComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  products: Product[] = [];
  totalRecords = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;
  loading = true;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  loadProducts(event: any) {
    this.loading = true;
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;

    this.productService.getProducts(this.currentPage, this.pageSize).subscribe(res => {
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.products = res?.items || [];
        this.totalRecords = res?.totalCount || 0;
        this.totalPages = res?.totalPages || 0;
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.table.onLazyLoad.emit({
      first: (page - 1) * this.pageSize,
      rows: this.pageSize
    });
  }

  changePageSize(newSize: number) {
    this.pageSize = newSize;
    this.table.onLazyLoad.emit({
      first: 0,
      rows: this.pageSize
    });
  }

  getPagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
