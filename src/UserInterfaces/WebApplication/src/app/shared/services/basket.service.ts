import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthStoreService } from './auth-store.service';
import {
  Basket,
  BasketItem,
  CreateBasketRequest,
  CheckoutBasketRequest,
} from '../models/basket.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private readonly apiUrl = environment.basketUrl;

  private basketSubject = new BehaviorSubject<Basket | null>(null);
  public basket$ = this.basketSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authStore: AuthStoreService,
    private router: Router
  ) {
    // Load basket when user changes
    this.authStore.user$.subscribe((user) => {
      if (user) {
        this.loadBasket();
      } else {
        this.basketSubject.next(null);
      }
    });
  }

  // Check if user is authenticated, redirect if not
  private requireAuthentication(): boolean {
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/auth'], {
        queryParams: { returnUrl: this.router.url },
      });
      return false;
    }
    return true;
  }

  // Load current user's basket
  loadBasket(): void {
    const user = this.authStore.getUser();
    if (user) {
      this.getBasketByUsername(user.username).subscribe({
        next: (basket) => {
          this.basketSubject.next(basket);
        },
        error: (error) => {
          console.error('Error loading basket:', error);
          this.errorSubject.next('Failed to load basket');
        },
      });
    }
  }

  // Add item to basket with authentication check
  addToBasket(
    productId: string,
    productName: string,
    price: number,
    quantity: number = 1,
    color: string = 'default'
  ): Observable<Basket> {
    if (!this.requireAuthentication()) {
      return throwError(() => new Error('Authentication required'));
    }

    const user = this.authStore.getUser()!;
    const basketItem: BasketItem = {
      productId,
      productName,
      price,
      quantity,
      color,
    };

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // First, get current basket (will auto-create if doesn't exist)
    return this.getBasketByUsername(user.username).pipe(
      map((currentBasket) => {
        // Add item to existing items (currentBasket is never null now)
        const existingItems = currentBasket?.items || [];
        const existingItemIndex = existingItems.findIndex(
          (item) => item.productId === productId && item.color === color
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          existingItems[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          existingItems.push(basketItem);
        }

        return {
          username: user.username,
          items: existingItems,
        };
      }),
      switchMap((basketData) => {
        // Create/update basket
        return this.createBasket({
          Cart: {
            UserName: basketData.username,
            Items: basketData.items,
          },
        });
      }),
      tap((basket) => {
        this.basketSubject.next(basket);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Error adding to basket:', error);
        this.errorSubject.next('Failed to add item to basket');
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  getBasketByUsername(username: string): Observable<Basket | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    const url = `${this.apiUrl}/basket/${username}`;
    console.log('Fetching basket for username:', username);
    console.log('Request URL:', url);

    return this.http.get<any>(url).pipe(
      map((response) => {
        console.log('Basket response received:', response);
        this.loadingSubject.next(false);
        return this.transformApiBasket(response);
      }),
      catchError((error) => {
        console.error('Error fetching basket:', error);

        // If basket doesn't exist (404 or BasketNotFoundException), create an empty basket
        if (
          error.status === 404 ||
          error.error?.message?.includes('BasketNotFoundException')
        ) {
          console.log(
            'Basket not found, creating empty basket for user:',
            username
          );

          // Create empty basket data
          const emptyBasketData: CreateBasketRequest = {
            Cart: {
              UserName: username,
              Items: [],
            },
          };

          // Create the empty basket and return it
          return this.createBasket(emptyBasketData).pipe(
            tap(() => {
              this.loadingSubject.next(false);
            }),
            catchError((createError) => {
              console.error('Error creating empty basket:', createError);
              this.loadingSubject.next(false);
              throw createError;
            })
          );
        }

        // For other errors, just propagate them
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  createBasket(basketData: CreateBasketRequest): Observable<Basket> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log('Creating basket with data:', basketData);
    console.log('Request URL:', `${this.apiUrl}/basket`);

    return this.http.post<any>(`${this.apiUrl}/basket`, basketData).pipe(
      map((response) => {
        console.log('Create basket response received:', response);
        this.loadingSubject.next(false);
        const transformedBasket = this.transformApiBasket(response);
        if (!transformedBasket) {
          throw new Error('Invalid basket response');
        }
        return transformedBasket;
      }),
      catchError((error) => {
        console.error('Error creating basket:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  storeBasket(
    username: string,
    basketData: CreateBasketRequest
  ): Observable<Basket> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log('Storing basket for username:', username);
    console.log('Request URL:', `${this.apiUrl}/basket`);

    return this.http.post<any>(`${this.apiUrl}/basket`, basketData).pipe(
      map((response) => {
        console.log('Store basket response received:', response);
        this.loadingSubject.next(false);
        const transformedBasket = this.transformApiBasket(response);
        if (!transformedBasket) {
          throw new Error('Invalid basket response');
        }
        return transformedBasket;
      }),
      catchError((error) => {
        console.error('Error storing basket:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  checkoutBasket(
    username: string,
    checkoutData: CheckoutBasketRequest
  ): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log('Checking out basket for username:', username);
    console.log('Request URL:', `${this.apiUrl}/basket/checkout`);

    return this.http
      .post<any>(`${this.apiUrl}/basket/checkout`, checkoutData)
      .pipe(
        map((response) => {
          console.log('Checkout response received:', response);
          this.loadingSubject.next(false);
          return response;
        }),
        catchError((error) => {
          console.error('Error checking out basket:', error);
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  deleteBasket(username: string): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    const url = `${this.apiUrl}/basket/${username}`;
    console.log('Deleting basket for username:', username);
    console.log('Request URL:', url);

    return this.http.delete<any>(url).pipe(
      map((response) => {
        console.log('Delete basket response received:', response);
        this.loadingSubject.next(false);
        this.basketSubject.next(null);
        return response;
      }),
      catchError((error) => {
        console.error('Error deleting basket:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // Remove item from basket
  removeFromBasket(
    productId: string,
    color: string = 'default'
  ): Observable<Basket> {
    if (!this.requireAuthentication()) {
      return throwError(() => new Error('Authentication required'));
    }

    const user = this.authStore.getUser()!;
    const currentBasket = this.basketSubject.value;

    if (!currentBasket) {
      return throwError(() => new Error('No basket found'));
    }

    const updatedItems = currentBasket.items.filter(
      (item) => !(item.productId === productId && item.color === color)
    );

    return this.createBasket({
      Cart: {
        UserName: user.username,
        Items: updatedItems,
      },
    }).pipe(
      tap((basket) => {
        this.basketSubject.next(basket);
      })
    );
  }

  // Update item quantity in basket
  updateQuantity(
    productId: string,
    quantity: number,
    color: string = 'default'
  ): Observable<Basket> {
    if (!this.requireAuthentication()) {
      return throwError(() => new Error('Authentication required'));
    }

    const user = this.authStore.getUser()!;
    const currentBasket = this.basketSubject.value;

    if (!currentBasket) {
      return throwError(() => new Error('No basket found'));
    }

    const updatedItems = currentBasket.items.map((item) => {
      if (item.productId === productId && item.color === color) {
        return { ...item, quantity };
      }
      return item;
    });

    return this.createBasket({
      Cart: {
        UserName: user.username,
        Items: updatedItems,
      },
    }).pipe(
      tap((basket) => {
        this.basketSubject.next(basket);
      })
    );
  }

  // Get basket item count
  getItemCount(): Observable<number> {
    return this.basket$.pipe(
      map((basket) => {
        if (!basket) return 0;
        return basket.items.reduce((total, item) => total + item.quantity, 0);
      })
    );
  }

  // Get basket total price
  getTotalPrice(): Observable<number> {
    return this.basket$.pipe(
      map((basket) => {
        if (!basket) return 0;
        return basket.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      })
    );
  }

  // Clear basket
  clearBasket(): Observable<any> {
    if (!this.requireAuthentication()) {
      return throwError(() => new Error('Authentication required'));
    }

    const user = this.authStore.getUser()!;
    return this.deleteBasket(user.username);
  }

  private transformApiBasket(apiResponse: any): Basket | null {
    if (!apiResponse || !apiResponse.cart) {
      return null;
    }

    const cart = apiResponse.cart;
    const totalPrice = cart.items.reduce(
      (total: number, item: any) => total + item.Price * item.Quantity,
      0
    );

    return {
      username: cart.userName,
      items: cart.items.map((item: any) => ({
        quantity: item.quantity,
        color: item.color,
        price: item.price,
        productId: item.productId,
        productName: item.productName,
      })),
      totalPrice,
    };
  }
}
