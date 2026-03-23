import { Component, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, PagedResult } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, BadgeModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class UserHomeComponent implements OnInit, OnDestroy {
  categories: string[] = [];
  products: Product[] = [];
  selectedCategory: string | null = null;
  searchTerm: string = '';
  cartCount: number = 0;
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
    this.loadData();
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
        this.cdr.detectChanges();
        return this.productService.getProducts(1, 20, term, this.selectedCategory || undefined).pipe(
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error in search stream', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadData() {
    this.productService.getProductTypes().subscribe({
      next: (res) => {
        this.categories = res;
        this.cdr.detectChanges();
      }
    });
  }

  loadProducts() {
    if (!this.selectedCategory && !this.searchTerm) {
      this.products = [];
      this.cdr.detectChanges();
      return;
    }

    console.log('Fetching products for category:', this.selectedCategory);
    
    this.productService.getProducts(1, 20, this.searchTerm, this.selectedCategory || undefined).pipe(
      finalize(() => {
        this.zone.run(() => {
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
    this.cdr.detectChanges();
    this.productService.getProducts(1, 20, this.searchTerm, type).subscribe({
      next: (res) => {
        this.products = res.items;
        this.cdr.detectChanges();
      }
    });
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
