import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpBackend,
  HttpContext,
} from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  Product,
  ProductResponse,
  CreateProductRequest,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = 'https://localhost:5050';
  private http: HttpClient;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(handler: HttpBackend) {
    // Create custom HttpClient that bypasses default interceptors and accepts self-signed certificates
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
      map((product) => {
        console.log('Product received:', product);
        this.loadingSubject.next(false);
        return this.transformApiProduct(product);
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

  private getMockProductResponse(): ProductResponse {
    const mockProducts: Product[] = [
      // {
      //   id: '0197ac7d-aa70-41fb-8be5-d97ffabe9fde',
      //   name: 'Margherita Pizza',
      //   description:
      //     'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
      //   imageFile: 'margherita-pizza.jpg',
      //   imageUrl:
      //     'https://via.placeholder.com/300x200/e3f2fd/1976d2?text=Margherita+Pizza',
      //   price: 12.99,
      //   category: ['c1', 'c2'], // Using category IDs as per API
      //   categories: ['c1', 'c2'],
      // },
      // {
      //   id: '0297ac7d-bb70-41fb-8be5-d97ffabe9fde',
      //   name: 'Caesar Salad',
      //   description:
      //     'Fresh romaine lettuce with caesar dressing, croutons, and parmesan cheese',
      //   imageFile: 'caesar-salad.jpg',
      //   imageUrl:
      //     'https://via.placeholder.com/300x200/e8f5e8/4caf50?text=Caesar+Salad',
      //   price: 8.99,
      //   category: ['c3', 'c4'],
      //   categories: ['c3', 'c4'],
      // },
      // {
      //   id: '0397ac7d-cc70-41fb-8be5-d97ffabe9fde',
      //   name: 'Chicken Burger',
      //   description:
      //     'Grilled chicken breast with lettuce, tomato, and special sauce',
      //   imageFile: 'chicken-burger.jpg',
      //   imageUrl:
      //     'https://via.placeholder.com/300x200/fff3e0/ff9800?text=Chicken+Burger',
      //   price: 10.99,
      //   category: ['c1', 'c5'],
      //   categories: ['c1', 'c5'],
      // },
      // {
      //   id: '0497ac7d-dd70-41fb-8be5-d97ffabe9fde',
      //   name: 'Spaghetti Carbonara',
      //   description:
      //     'Classic Italian pasta with eggs, cheese, pancetta, and black pepper',
      //   imageFile: 'spaghetti-carbonara.jpg',
      //   imageUrl:
      //     'https://via.placeholder.com/300x200/fce4ec/e91e63?text=Spaghetti+Carbonara',
      //   price: 14.99,
      //   category: ['c2', 'c6'],
      //   categories: ['c2', 'c6'],
      // },
      // {
      //   id: '0597ac7d-ee70-41fb-8be5-d97ffabe9fde',
      //   name: 'Fish and Chips',
      //   description:
      //     'Beer-battered fish served with crispy chips and tartar sauce',
      //   imageFile: 'fish-and-chips.jpg',
      //   imageUrl:
      //     'https://via.placeholder.com/300x200/e3f2fd/2196f3?text=Fish+and+Chips',
      //   price: 16.99,
      //   category: ['c7', 'c8'],
      //   categories: ['c7', 'c8'],
      // },
      // {
      //   id: '0697ac7d-ff70-41fb-8be5-d97ffabe9fde',
      //   name: 'Chocolate Cake',
      //   description:
      //     'Rich chocolate cake with chocolate frosting and chocolate chips',
      //   imageFile: 'chocolate-cake.jpg',
      //   imageUrl:
      //     'https://via.placeholder.com/300x200/efebe9/8d6e63?text=Chocolate+Cake',
      //   price: 6.99,
      //   category: ['c9', 'c10'],
      //   categories: ['c9', 'c10'],
      // },
    ];

    return {
      products: mockProducts,
      pageIndex: 0,
      pageSize: 10,
      count: mockProducts.length,
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
