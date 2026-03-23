import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService, PagedResult } from '../../../services/product.service';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
    TextareaModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
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

  // Add Product Dialog
  displayAddDialog = false;
  isEditMode = false;
  displayBulkDialog = false;
  newProduct: Partial<Product> = {
    name: '',
    type: '',
    price: 0,
    quantity: 0,
    details: ''
  };
  selectedFile: File | null = null;
  selectedBulkFile: File | null = null;
  uploading = false;
  bulkUploading = false;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {}

  showAddProductDialog() {
    this.newProduct = { name: '', type: '', price: 0, quantity: 0, details: '' };
    this.selectedFile = null;
    this.isEditMode = false;
    this.displayAddDialog = true;
  }

  editProduct(product: Product) {
    this.newProduct = { ...product };
    this.selectedFile = null;
    this.isEditMode = true;
    this.displayAddDialog = true;
  }

  confirmDelete(product: Product) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete <b>${product.name}</b>?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully' });
            this.table.onLazyLoad.emit({ first: 0, rows: this.pageSize });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product' })
        });
      }
    });
  }

  showBulkUploadDialog() {
    this.selectedBulkFile = null;
    this.displayBulkDialog = true;
  }

  onFileSelect(event: any) {
    this.selectedFile = event.files[0];
  }

  onBulkFileSelect(event: any) {
    const file = event.files[0];
    const allowedExtensions = ['csv', 'xls', 'xlsx'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Invalid File', 
        detail: 'Only CSV, XLS, and XLSX files are allowed' 
      });
      return;
    }
    this.selectedBulkFile = file;
  }

  importProducts() {
    if (!this.selectedBulkFile) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a file to upload' });
      return;
    }

    this.bulkUploading = true;
    this.productService.importProducts(this.selectedBulkFile).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Products imported successfully' });
        this.displayBulkDialog = false;
        this.bulkUploading = false;
        this.table.onLazyLoad.emit({ first: 0, rows: this.pageSize }); // Refresh grid
      },
      error: (err) => {
        console.error('Import error:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to import products' });
        this.bulkUploading = false;
      }
    });
  }

  saveProduct() {
    if (!this.newProduct.name || !this.newProduct.type) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name and Type are required' });
      return;
    }

    this.uploading = true;

    const saveObs = this.isEditMode 
      ? this.productService.updateProduct((this.newProduct as Product).id, this.newProduct as Product)
      : this.productService.createProduct(this.newProduct as Product);

    saveObs.subscribe({
      next: (savedProduct) => {
        if (this.selectedFile) {
          this.productService.uploadProductImage(savedProduct.id, this.selectedFile).subscribe({
            next: () => this.finalizeSave(),
            error: () => {
              this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Product saved but image upload failed' });
              this.finalizeSave();
            }
          });
        } else {
          this.finalizeSave();
        }
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save product' });
        this.uploading = false;
      }
    });
  }

  private finalizeSave() {
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: this.isEditMode ? 'Product updated' : 'Product created' 
    });
    this.displayAddDialog = false;
    this.uploading = false;
    this.table.onLazyLoad.emit({ first: 0, rows: this.pageSize });
  }

  loadProducts(event: any) {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;

    this.productService.getProducts(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.products = res?.items || [];
          this.totalRecords = res?.totalCount || 0;
          this.totalPages = res?.totalPages || 0;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products' });
      }
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
