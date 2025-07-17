import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { BasketService } from '../../shared/services/basket.service';
import { AuthStoreService } from '../../shared/services/auth-store.service';
import { Router } from '@angular/router';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Basket } from '../../shared/models/basket.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  basket$: Observable<Basket | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  totalPrice$: Observable<number>;

  constructor(
    private basketService: BasketService,
    private authStore: AuthStoreService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.basket$ = this.basketService.basket$;
    this.loading$ = this.basketService.loading$;
    this.error$ = this.basketService.error$;
    this.totalPrice$ = this.basketService.getTotalPrice();
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    // Load basket
    this.basketService.loadBasket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  increaseQuantity(
    productId: string,
    currentQuantity: number,
    color: string = 'default'
  ): void {
    this.basketService
      .updateQuantity(productId, currentQuantity + 1, color)
      .subscribe({
        next: () => {
          this.snackBar.open('Quantity updated', 'Close', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.snackBar.open('Failed to update quantity', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      });
  }

  decreaseQuantity(
    productId: string,
    currentQuantity: number,
    color: string = 'default'
  ): void {
    if (currentQuantity <= 1) {
      this.removeItem(productId, color);
      return;
    }

    this.basketService
      .updateQuantity(productId, currentQuantity - 1, color)
      .subscribe({
        next: () => {
          this.snackBar.open('Quantity updated', 'Close', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.snackBar.open('Failed to update quantity', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      });
  }

  removeItem(productId: string, color: string = 'default'): void {
    this.basketService.removeFromBasket(productId, color).subscribe({
      next: () => {
        this.snackBar.open('Item removed from cart', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.snackBar.open('Failed to remove item', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
    });
  }

  clearCart(): void {
    this.basketService.clearBasket().subscribe({
      next: () => {
        this.snackBar.open('Cart cleared', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        this.snackBar.open('Failed to clear cart', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  checkout(): void {
    // Navigate to checkout page (to be implemented)
    this.snackBar.open('Checkout functionality coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
