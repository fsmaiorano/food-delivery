import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { ProductService } from '../../../shared/services/product.service';
import { BasketService } from '../../../shared/services/basket.service';
import { AuthStoreService } from '../../../shared/services/auth-store.service';
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
    private basketService: BasketService,
    private authStore: AuthStoreService,
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
    if (!this.product) return;

    // Check if user is authenticated
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/auth'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    // Add to basket
    this.basketService
      .addToBasket(
        this.product.id,
        this.product.name,
        this.product.price,
        1, // quantity
        'default' // color
      )
      .subscribe({
        next: (basket) => {
          console.log('Item added to basket:', basket);
          this.snackBar.open(`${this.product!.name} added to cart!`, 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        error: (error) => {
          console.error('Error adding item to basket:', error);
          this.snackBar.open('Failed to add item to cart', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      });
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
