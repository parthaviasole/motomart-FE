import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  // Fallback for PascalCase from API
  Id?: string;
  UserId?: string;
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
  IsDefault?: boolean;
}

export interface AddressCreateDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) { }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl);
  }

  getAddress(id: string): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/${id}`);
  }

  createAddress(address: AddressCreateDto): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, address);
  }

  updateAddress(id: string, address: AddressCreateDto): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, address);
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setDefaultAddress(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/default`, {});
  }
}
