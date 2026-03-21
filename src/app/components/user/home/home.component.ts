import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, PagedResult } from '../../../services/product.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, BadgeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class UserHomeComponent implements OnInit {
  categories: any[] = [];
  products: Product[] = [];
  selectedCategory: string | null = null;
  searchTerm: string = '';
  loading: boolean = true;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.productService.getProductTypesSummary().pipe(
      finalize(() => {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.value || []);
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading categories', err);
      }
    });
  }

  loadProducts() {
    if (!this.selectedCategory && !this.searchTerm) {
      this.products = [];
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    console.log('Fetching products for category:', this.selectedCategory);
    
    this.productService.getProducts(1, 20, this.searchTerm, this.selectedCategory || undefined).pipe(
      finalize(() => {
        this.zone.run(() => {
          this.loading = false;
          console.log('Loading products finished. Products count:', this.products.length);
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (res: PagedResult<Product>) => {
        console.log('Products API Response:', res);
        this.products = res.items;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading products', err);
      }
    });
  }

  selectCategory(type: string) {
    this.selectedCategory = type;
    this.loadProducts();
  }

  clearCategory() {
    this.selectedCategory = null;
    this.searchTerm = '';
    this.products = [];
    this.cdr.detectChanges();
  }

  onSearch() {
    if (this.searchTerm) {
      this.selectedCategory = null;
    }
    this.loadProducts();
  }
}
