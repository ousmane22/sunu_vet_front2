import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category, CategoryListResponse, CategorySingleResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/business/categories`;

  getAll(): Observable<CategoryListResponse> {
    return this.http.get<CategoryListResponse>(this.apiUrl);
  }

  getById(id: number): Observable<CategorySingleResponse> {
    return this.http.get<CategorySingleResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Category>): Observable<CategorySingleResponse> {
    return this.http.post<CategorySingleResponse>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Category>): Observable<CategorySingleResponse> {
    return this.http.put<CategorySingleResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
