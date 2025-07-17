import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpBackend } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Basket,
  CreateBasketRequest,
  CheckoutBasketRequest,
} from '../models/basket.model';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private readonly apiUrl = 'https://localhost:5051';
  private http: HttpClient;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
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
        console.log('Basket created response:', response);
        this.loadingSubject.next(false);
        return this.transformApiBasket(response);
      }),
      catchError((error) => {
        console.error('Error creating basket:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  updateBasket(
    username: string,
    basketData: CreateBasketRequest
  ): Observable<Basket> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log(
      'Updating basket for username:',
      username,
      'with data:',
      basketData
    );
    console.log('Request URL:', `${this.apiUrl}/basket`);

    return this.http.post<any>(`${this.apiUrl}/basket`, basketData).pipe(
      map((response) => {
        console.log('Basket updated response:', response);
        this.loadingSubject.next(false);
        return this.transformApiBasket(response);
      }),
      catchError((error) => {
        console.error('Error updating basket:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  deleteBasket(username: string): Observable<boolean> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log('Deleting basket for username:', username);
    console.log('Request URL:', `${this.apiUrl}/basket/${username}`);

    return this.http.delete(`${this.apiUrl}/basket/${username}`).pipe(
      map(() => {
        console.log('Basket deleted successfully');
        this.loadingSubject.next(false);
        return true;
      }),
      catchError((error) => {
        console.error('Error deleting basket:', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  checkoutBasket(checkoutData: CheckoutBasketRequest): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log('Checking out basket with data:', checkoutData);
    console.log('Request URL:', `${this.apiUrl}/basket/checkout`);

    return this.http
      .post<any>(`${this.apiUrl}/basket/checkout`, checkoutData)
      .pipe(
        map((response) => {
          console.log('Checkout response:', response);
          this.loadingSubject.next(false);
          return response;
        }),
        catchError((error) => {
          console.error('Error during checkout:', error);
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  calculateTotalPrice(items: any[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  createBasketRequest(username: string, items: any[]): CreateBasketRequest {
    return {
      Cart: {
        UserName: username,
        Items: items,
      },
    };
  }

  private transformApiBasket(apiBasket: any): Basket {
    const basket = apiBasket.Cart || apiBasket.cart || apiBasket;

    return {
      username: basket.UserName || basket.username || basket.Username,
      items: basket.Items || basket.items || [],
      totalPrice: basket.TotalPrice || basket.totalPrice || 0,
    };
  }
}
