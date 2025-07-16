import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../shared/models/product.model';
import { MaterialModule } from '../../../shared/material.module';
@Component({
  selector: 'app-product-card',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private router: Router) {}

  getImageUrl(imageFile?: string): string {
    if (this.product.imageUrl) {
      return this.product.imageUrl;
    }

    if (imageFile) {
      return `https://via.placeholder.com/300x200/e3f2fd/1976d2?text=${encodeURIComponent(
        this.product.name
      )}`;
    }

    return `https://via.placeholder.com/300x200/e3f2fd/1976d2?text=${encodeURIComponent(
      this.product.name
    )}`;
  }

  onImageError(event: any): void {
    event.target.src = `https://via.placeholder.com/300x200/f5f5f5/999999?text=${encodeURIComponent(
      this.product.name
    )}`;
  }

  viewDetails(): void {
    this.router.navigate(['/products', this.product.id]);
  }
}
