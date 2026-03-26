import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from './product.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export interface UserUpdateDto {
  name: string;
  email: string;
  phoneNumber: string;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getUsers(page: number = 1, pageSize: number = 10, searchTerm?: string): Observable<PagedResult<User>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PagedResult<User>>(this.apiUrl, { params });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateUser(id: string, user: UserUpdateDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }
}
