import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../shared/models/product.model';
import { MaterialModule } from '../../../shared/material.module';
import { BasketService } from '../../../shared/services/basket.service';
@Component({
  selector: 'app-product-card',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private router: Router, private basketService: BasketService) {}

  viewDetails(): void {
    this.router.navigate(['/products', this.product.id]);
  }

  addToCart(product: Product): void {
    console.log('Adding to cart:', product);
  }
}
