import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { BasketService } from '../../shared/services/basket.service';
import {
  AuthStoreService,
  AuthUser,
} from '../../shared/services/auth-store.service';
import { Router } from '@angular/router';
import { Subject, takeUntil, Observable, firstValueFrom } from 'rxjs';
import {
  Basket,
  BasketCheckoutDto,
  CheckoutBasketRequest,
} from '../../shared/models/basket.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  basket$: Observable<Basket | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  totalPrice$: Observable<number>;

  showCheckoutForm = false;
  checkoutForm: FormGroup;
  paymentMethods = [
    { value: 1, label: 'Credit Card' },
    { value: 2, label: 'Debit Card' },
    { value: 3, label: 'PayPal' },
  ];

  constructor(
    private basketService: BasketService,
    private authStore: AuthStoreService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.basket$ = this.basketService.basket$;
    this.loading$ = this.basketService.loading$;
    this.error$ = this.basketService.error$;
    this.totalPrice$ = this.basketService.getTotalPrice();

    this.checkoutForm = this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      emailAddress: ['', [Validators.required, Validators.email]],

      // Address Information
      addressLine: ['', [Validators.required, Validators.minLength(5)]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)],
      ],

      // Payment Information
      paymentMethod: [1, [Validators.required]],
      cardName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiration: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  ngOnInit(): void {
    this.basketService.loadBasket();

    // Fill form with mock data in development environment
    if (!environment.production) {
      this.fillWithMockData();
    }
  }

  private fillWithMockData(): void {
    this.checkoutForm.patchValue({
      // Personal Information
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john.doe@example.com',

      // Address Information
      addressLine: '123 Main Street, Apt 4B',
      country: 'United States',
      state: 'California',
      zipCode: '90210',

      // Payment Information
      paymentMethod: 1,
      cardName: 'John Doe',
      cardNumber: '4532015112830366',
      expiration: '12/27',
      cvv: '123',
    });
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
            verticalPosition: 'bottom',
          });
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.snackBar.open('Failed to update quantity', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
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
            verticalPosition: 'bottom',
          });
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.snackBar.open('Failed to update quantity', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
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
          verticalPosition: 'bottom',
        });
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.snackBar.open('Failed to remove item', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
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
          verticalPosition: 'bottom',
        });
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        this.snackBar.open('Failed to clear cart', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  showCheckout(): void {
    this.showCheckoutForm = true;

    // Show notification about mock data in development
    if (!environment.production) {
      this.snackBar.open(
        'Development mode: Checkout form filled with mock data',
        'Close',
        {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        }
      );
    }
  }

  hideCheckout(): void {
    this.showCheckoutForm = false;
  }

  loadMockData(): void {
    if (!environment.production) {
      this.fillWithMockData();
      this.snackBar.open('Mock data reloaded', 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      });
    }
  }

  isDevelopment(): boolean {
    return !environment.production;
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      value = parts.join(' ');
    } else {
      value = match;
    }

    this.checkoutForm.patchValue({ cardNumber: value.replace(/\s/g, '') });
  }

  formatExpiration(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.checkoutForm.patchValue({ expiration: value });
  }

  async checkout(): Promise<void> {
    if (!this.checkoutForm.valid) {
      this.markFormGroupTouched();
      this.snackBar.open(
        'Please fill in all required fields correctly',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        }
      );
      return;
    }

    const user: AuthUser = this.authStore.getUser()!;

    try {
      if (!user || !user.username) {
        this.snackBar.open('You must be logged in to checkout', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        });
        return;
      }

      const basket = await firstValueFrom(
        this.basket$.pipe(takeUntil(this.destroy$))
      );

      if (!basket || basket.items.length === 0) {
        this.snackBar.open('Your cart is empty', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        });
        return;
      }

      const formData = this.checkoutForm.value;
      const totalPrice =
        (await firstValueFrom(
          this.totalPrice$.pipe(takeUntil(this.destroy$))
        )) || 0;

      const basketCheckoutDto: BasketCheckoutDto = {
        userName: user.username,
        customerId: user.id,
        totalPrice: totalPrice,
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.emailAddress,
        addressLine: formData.addressLine,
        country: formData.country,
        state: formData.state,
        zipCode: formData.zipCode,
        cardName: formData.cardName,
        cardNumber: formData.cardNumber,
        expiration: formData.expiration,
        cvv: formData.cvv,
        paymentMethod: formData.paymentMethod,
      };

      const request: CheckoutBasketRequest = {
        BasketCheckoutDto: basketCheckoutDto,
      };

      debugger;
      await firstValueFrom(this.basketService.checkoutBasket(request));

      this.snackBar.open(
        'Checkout successful! Your order has been placed.',
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        }
      );

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error during checkout:', error);
      this.snackBar.open('Checkout failed. Please try again.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach((key) => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.checkoutForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('email')) {
      return 'Enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} is too short`;
    }
    if (control?.hasError('pattern')) {
      switch (fieldName) {
        case 'zipCode':
          return 'Enter a valid ZIP code (12345 or 12345-6789)';
        case 'cardNumber':
          return 'Enter a valid 16-digit card number';
        case 'expiration':
          return 'Enter expiration date as MM/YY';
        case 'cvv':
          return 'Enter a valid CVV (3-4 digits)';
        default:
          return `Invalid ${fieldName} format`;
      }
    }
    return '';
  }
}
