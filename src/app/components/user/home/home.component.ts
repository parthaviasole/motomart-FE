import { Component, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, PagedResult } from '../../../services/product.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { finalize, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, BadgeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class UserHomeComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  products: Product[] = [];
  selectedCategory: string | null = null;
  searchTerm: string = '';
  loading: boolean = true;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(term => {
        if (!term && !this.selectedCategory) {
          return of({ 
            items: [], 
            currentPage: 1, 
            totalPages: 0, 
            pageSize: 20, 
            totalCount: 0, 
            hasPrevious: false, 
            hasNext: false 
          } as PagedResult<Product>);
        }
        this.loading = true;
        this.cdr.detectChanges();
        return this.productService.getProducts(1, 20, term, this.selectedCategory || undefined).pipe(
          finalize(() => {
            this.zone.run(() => {
              this.loading = false;
              this.cdr.detectChanges();
            });
          })
        );
      })
    ).subscribe({
      next: (res: PagedResult<Product>) => {
        this.products = res.items;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error in search stream', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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
    this.searchSubject.next(this.searchTerm);
  }

  onSearchChange(event: any) {
    this.searchSubject.next(this.searchTerm);
  }
}
