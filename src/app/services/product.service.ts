import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Product {
  id: number;
  type: string;
  name: string;
  details?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(page: number = 1, pageSize: number = 10, searchTerm?: string, type?: string): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => {
        if (Array.isArray(res)) {
          return {
            items: res,
            currentPage: page,
            totalPages: Math.ceil(res.length / pageSize),
            pageSize: pageSize,
            totalCount: res.length,
            hasPrevious: page > 1,
            hasNext: page < Math.ceil(res.length / pageSize)
          };
        }
        return res;
      })
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/types`);
  }

  getProductTypesSummary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/types/summary`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-image`, formData);
  }

  uploadProductImage(id: number, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/${id}/upload-image`, formData);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importProducts(file: File): Observable<Product[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product[]>(`${this.apiUrl}/import`, formData);
  }
}
