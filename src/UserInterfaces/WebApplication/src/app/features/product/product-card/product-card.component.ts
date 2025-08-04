import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../shared/models/product.model';
import { MaterialModule } from '../../../shared/material.module';
import { BasketService } from '../../../shared/services/basket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(
    private router: Router,
    private basketService: BasketService,
    private snackBar: MatSnackBar
  ) {}

  viewDetails(): void {
    this.router.navigate(['/products', this.product.id]);
  }

  addToCart(product: Product): void {
    console.log('Adding to cart:', product);

    this.basketService
      .addToBasket(product.id, product.name, product.price, 1, 'default')
      .subscribe({
        next: (basket) => {
          console.log('Item added to basket:', basket);
          this.snackBar.open('Item added to cart!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
          });
        },
        error: (error) => {
          console.error('Error adding item to basket:', error);

          if (error.contains('1001')) return;

          this.snackBar.open('Failed to add item to cart', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
          });
        },
      });
  }
}
