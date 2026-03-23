import { Component, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, PagedResult } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RouterModule } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { finalize, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, BadgeModule, RouterModule, PaginatorModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class UserProductsComponent implements OnInit, OnDestroy {
  categories: string[] = [];
  products: Product[] = [];
  selectedCategory: string = 'All';
  searchTerm: string = '';
  cartCount: number = 0;
  pageSize: number = 20;
  currentPage: number = 1;
  totalRecords: number = 0;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.setupSearch();
    this.cartService.cartItems$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToCart(productId: number) {
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Added to Cart',
          life: 2000 
        });
      },
      error: (err) => {
        console.error('Error adding to cart', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to add to cart',
          life: 3000 
        });
      }
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(term => {
        this.currentPage = 1; // Reset to first page on search
        this.cdr.detectChanges();
        const type = this.selectedCategory === 'All' ? undefined : this.selectedCategory;
        return this.productService.getProducts(this.currentPage, this.pageSize, term, type).pipe(
          finalize(() => {
            this.zone.run(() => {
              this.cdr.detectChanges();
            });
          })
        );
      })
    ).subscribe({
      next: (res: PagedResult<Product>) => {
        this.products = res.items;
        this.totalRecords = res.totalCount;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error in search stream', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories() {
    this.productService.getProductTypes().subscribe({
      next: (res) => {
        this.categories = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadProducts() {
    const type = this.selectedCategory === 'All' ? undefined : this.selectedCategory;
    
    this.productService.getProducts(this.currentPage, this.pageSize, this.searchTerm, type).pipe(
      finalize(() => {
        this.zone.run(() => {
          this.cdr.detectChanges();
        });
      })
    ).subscribe({ 
      next: (res: PagedResult<Product>) => {
        this.products = res.items;
        this.totalRecords = res.totalCount;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  onPageChange(event: any) {
    this.currentPage = (event.page || 0) + 1;
    this.pageSize = event.rows || 20;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1; // Reset to first page on category change
    this.loadProducts();
  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  onSearchChange(event: any) {
    this.searchSubject.next(this.searchTerm);
  }
}
