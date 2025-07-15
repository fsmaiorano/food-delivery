import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { ProductService } from '../../../shared/services/product.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../../shared/models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.handleError('Product ID not found');
      return;
    }

    this.loadProductDetails(productId);
    this.subscribeToServiceState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProductDetails(productId: string): void {
    this.productService
      .getProductById(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          debugger;
          if (product) {
            this.product = product;
          } else {
            this.handleError('Product not found');
          }
          this.loading = false;
        },
        error: () => {
          this.handleError('Failed to load product details');
        },
      });
  }

  private subscribeToServiceState(): void {
    this.productService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.productService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        if (error) {
          this.handleError(error);
        }
      });
  }

  private handleError(errorMessage: string): void {
    this.error = errorMessage;
    this.loading = false;
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  addToCart(): void {
    // Implement add to cart functionality
    if (this.product) {
      this.snackBar.open(`${this.product.name} added to cart`, 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  getCategoryDisplay(): string {
    if (!this.product) return 'Uncategorized';

    const category = this.product.category;

    if (!category) return 'Uncategorized';

    if (Array.isArray(category)) {
      return category.length > 0 ? category.join(', ') : 'Uncategorized';
    }

    return String(category);
  }
}
