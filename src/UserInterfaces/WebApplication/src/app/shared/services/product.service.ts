import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpBackend } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Product,
  ProductResponse,
  CreateProductRequest,
} from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = environment.catalogUrl;
  private http: HttpClient;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  getProducts(
    pageIndex: number = 0,
    pageSize: number = 10
  ): Observable<ProductResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const pageNumber = pageIndex + 1;

    const params = new HttpParams()
      .set('page', pageNumber.toString())
      .set('size', pageSize.toString());

    const url = `${this.apiUrl}/products`;
    console.log('Fetching products:', 'Page:', pageIndex, 'Size:', pageSize);
    console.log('Request URL:', url, 'Params:', params.toString());

    return this.http.get<any>(url, { params }).pipe(
      map((response) => {
        console.log('Response received:', response);
        this.loadingSubject.next(false);

        const transformedResponse: ProductResponse = {
          products: this.transformApiProducts(response.products || response),
          pageIndex: pageIndex,
          pageSize: pageSize,
          count:
            response.count || (Array.isArray(response) ? response.length : 0),
        };

        return transformedResponse;
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  getProductsByCategory(
    category: string,
    pageIndex: number = 0,
    pageSize: number = 10
  ): Observable<ProductResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const pageNumber = pageIndex + 1;

    const params = new HttpParams()
      .set('page', pageNumber.toString())
      .set('size', pageSize.toString());

    const url = `${this.apiUrl}/products/category/${category}`;
    console.log(
      'Fetching products by category:',
      category,
      'Page:',
      pageIndex,
      'Size:',
      pageSize
    );
    console.log('Request URL:', url, 'Params:', params.toString());
    return this.http.get<any>(url, { params }).pipe(
      map((response) => {
        console.log('Response received:', response);
        this.loadingSubject.next(false);
        const transformedResponse: ProductResponse = {
          products: this.transformApiProducts(response.products || response),
          pageIndex: pageIndex,
          pageSize: pageSize,
          count:
            response.count || (Array.isArray(response) ? response.length : 0),
        };

        return transformedResponse;
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        return [];
      })
    );
  }

  getProductById(id: string): Observable<Product | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    const url = `${this.apiUrl}/products/${id}`;
    console.log('Fetching product by ID:', id);
    console.log('Request URL:', url);
    return this.http.get<any>(`${url}`).pipe(
      map((response) => {
        console.log('Product received:', response.product);
        this.loadingSubject.next(false);
        return this.transformApiProduct(response.product);
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  getCategories(): Observable<string[]> {
    return this.getProducts(0, 100).pipe(
      map((response) => {
        console.log('Categories fetched:', response.products);
        const allCategories = response.products.flatMap((p) => p.category);
        return [...new Set(allCategories)];
      })
    );
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  private transformApiProducts(apiProducts: any[]): Product[] {
    if (!Array.isArray(apiProducts)) {
      return [];
    }

    return apiProducts.map((product) => this.transformApiProduct(product));
  }

  private transformApiProduct(apiProduct: any): Product {
    return {
      id: apiProduct.id || apiProduct.Id,
      name: apiProduct.name || apiProduct.Name,
      description: apiProduct.description || apiProduct.Description,
      imageFile: apiProduct.imageFile || apiProduct.ImageFile,
      imageUrl: apiProduct.imageUrl || apiProduct.ImageUrl,
      price: apiProduct.price || apiProduct.Price,
      category:
        apiProduct.category ||
        apiProduct.categories ||
        apiProduct.Categories ||
        [],
      categories: apiProduct.categories || apiProduct.Categories,
    };
  }

  createProduct(productData: CreateProductRequest): Observable<Product> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<any>(`${this.apiUrl}/products`, productData).pipe(
      map((response) => {
        this.loadingSubject.next(false);
        return this.transformApiProduct(response);
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  updateProduct(
    id: string,
    productData: Partial<CreateProductRequest>
  ): Observable<Product> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .put<any>(`${this.apiUrl}/products/${id}`, productData)
      .pipe(
        map((response) => {
          this.loadingSubject.next(false);
          return this.transformApiProduct(response);
        }),
        catchError((error) => {
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  deleteProduct(id: string): Observable<boolean> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete(`${this.apiUrl}/products/${id}`).pipe(
      map(() => {
        this.loadingSubject.next(false);
        return true;
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }
}
