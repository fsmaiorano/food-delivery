import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ProductService } from '../../shared/services/product.service';
import { AuthService } from '../../shared/services/auth.service';
import { BasketService } from '../../shared/services/basket.service';
import {
  AuthStoreService,
  AuthUser,
} from '../../shared/services/auth-store.service';
import { Product, ProductResponse } from '../../shared/models/product.model';
import { Subject, takeUntil, Observable } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FilterComponent } from './filter/filter.component';
import { ProductCardComponent } from '../product/product-card/product-card.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ProductCardComponent,
    FilterComponent,
    HeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  products: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  loading = false;
  error: string | null = null;
  currentUser$: Observable<AuthUser | null>;
  cartItemCount$: Observable<number>;

  pageIndex = 0;
  pageSize = 100;
  totalCount = 0;
  pageSizeOptions = [6, 9, 12, 24];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private authStore: AuthStoreService,
    private basketService: BasketService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.currentUser$ = this.authStore.user$;
    this.cartItemCount$ = this.basketService.getItemCount();
  }

  ngOnInit(): void {
    this.loadData();
    this.subscribeToServiceState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToServiceState(): void {
    this.productService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.productService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.error = error;
        if (error) {
          this.snackBar.open(error, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
  }

  private loadData(): void {
    this.loadProducts();

    this.productService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => {
        this.categories = categories;
      });
  }

  private loadProducts(): void {
    const request = this.selectedCategory
      ? this.productService.getProductsByCategory(
          this.selectedCategory,
          this.pageIndex,
          this.pageSize
        )
      : this.productService.getProducts(this.pageIndex, this.pageSize);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ProductResponse) => {
        this.products = response.products || [];
        this.totalCount = response.count || 0;
      },
      error: () => {
        this.products = [];
        this.totalCount = 0;
      },
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.pageIndex = 0;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  refreshProducts(): void {
    this.productService.clearError();
    this.loadProducts();
  }

  clearCategoryFilter(): void {
    this.selectedCategory = '';
    this.pageIndex = 0;
    this.loadProducts();
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
