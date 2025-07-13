import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../../shared/services/product.service';
import { Product, ProductResponse } from '../../shared/models/product.model';
import { Subject, takeUntil } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, ProductCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  products: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  loading = false;
  error: string | null = null;

  // Pagination
  pageIndex = 0;
  pageSize = 9;
  totalCount = 0;
  pageSizeOptions = [6, 9, 12, 24];

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.subscribeToServiceState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToServiceState(): void {
    // Subscribe to loading state
    this.productService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    // Subscribe to error state
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
    // Load products first
    this.loadProducts();

    // Load categories separately
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

    request
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: ProductResponse) => {
        this.products = response.products;
        this.totalCount = response.count;
      });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.pageIndex = 0; // Reset to first page when changing category
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
