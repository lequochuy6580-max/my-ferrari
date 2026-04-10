import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  // Lấy toàn bộ sản phẩm
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy sản phẩm mới — filter theo query param
  getNewProducts(): Observable<Product[]> {
    const params = new HttpParams().set('isNew', 'true');
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy sản phẩm nổi bật — filter theo query param
  getFeaturedProducts(): Observable<Product[]> {
    const params = new HttpParams().set('featured', 'true');
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy sản phẩm theo ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Xử lý lỗi tập trung
  private handleError(error: any): Observable<never> {
    console.error('ProductService error:', error);
    return throwError(() => new Error(error?.message || 'Server error'));
  }
}