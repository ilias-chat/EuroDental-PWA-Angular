import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ProductsListResponse } from '@core/models/product.model';

export interface ProductsQuery {
  page?: number;
  search?: string;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getProducts(query: ProductsQuery = {}) {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 20));

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ProductsListResponse>(`${this.base}/catalog/products`, { params });
  }
}
