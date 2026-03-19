import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService, PagedResult } from '../../../services/product.service';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    DialogModule, 
    FileUploadModule, 
    FormsModule, 
    ToastModule, 
    FloatLabelModule, 
    TextareaModule
  ],
  providers: [MessageService],
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

  // Add Product Dialog
  displayAddDialog = false;
  newProduct: Partial<Product> = {
    name: '',
    type: '',
    price: 0,
    quantity: 0,
    details: ''
  };
  selectedFile: File | null = null;
  uploading = false;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {}

  showAddProductDialog() {
    this.newProduct = { name: '', type: '', price: 0, quantity: 0, details: '' };
    this.selectedFile = null;
    this.displayAddDialog = true;
  }

  onFileSelect(event: any) {
    this.selectedFile = event.files[0];
  }

  saveProduct() {
    if (!this.newProduct.name || !this.selectedFile) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields and select an image' });
      return;
    }

    this.uploading = true;
    this.productService.uploadImage(this.selectedFile).subscribe({
      next: (res) => {
        const productToCreate = { ...this.newProduct, imageUrl: res.url } as Product;
        this.productService.createProduct(productToCreate).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product created successfully' });
            this.displayAddDialog = false;
            this.uploading = false;
            this.table.onLazyLoad.emit({ first: 0, rows: this.pageSize }); // Refresh grid
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create product' });
            this.uploading = false;
          }
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload image' });
        this.uploading = false;
      }
    });
  }

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
