import { Component, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, PagedResult } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RouterModule } from '@angular/router';
import { finalize, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, BadgeModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class UserProductsComponent implements OnInit, OnDestroy {
  categories: string[] = [];
  products: Product[] = [];
  selectedCategory: string = 'All';
  searchTerm: string = '';
  loading: boolean = true;
  cartCount: number = 0;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
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
        alert('Added to cart!');
      },
      error: (err) => {
        console.error('Error adding to cart', err);
      }
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(term => {
        this.loading = true;
        this.cdr.detectChanges();
        const type = this.selectedCategory === 'All' ? undefined : this.selectedCategory;
        return this.productService.getProducts(1, 50, term, type).pipe(
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

  loadCategories() {
    this.productService.getProductTypes().subscribe({
      next: (types) => {
        this.categories = ['All', ...types];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadProducts() {
    this.loading = true;
    const type = this.selectedCategory === 'All' ? undefined : this.selectedCategory;
    
    this.productService.getProducts(1, 50, this.searchTerm, type).pipe(
      finalize(() => {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (res: PagedResult<Product>) => {
        this.products = res.items;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.loadProducts();
  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  onSearchChange(event: any) {
    this.searchSubject.next(this.searchTerm);
  }
}
