import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <mat-card class="product-card" [class.hover]="true">
      <mat-card-header>
        <div class="product-image-container">
          <img
            mat-card-image
            [src]="getImageUrl(product.imageFile)"
            [alt]="product.name"
            class="product-image"
            (error)="onImageError($event)"
          />
        </div>
      </mat-card-header>

      <mat-card-content>
        <div class="product-info">
          <h3 class="product-title">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>

          <div class="product-categories">
            <mat-chip-set>
              <mat-chip
                *ngFor="let category of product.category"
                class="category-chip"
              >
                {{ category }}
              </mat-chip>
            </mat-chip-set>
          </div>

          <div class="product-price">
            <span class="price-label">Price:</span>
            <span class="price-value"
              >\${{ product.price | number : '1.2-2' }}</span
            >
          </div>
        </div>
      </mat-card-content>

      <mat-card-actions align="end">
        <button mat-raised-button color="primary" class="add-to-cart-btn">
          <mat-icon>add_shopping_cart</mat-icon>
          Add to Cart
        </button>
        <button mat-stroked-button color="accent" class="view-details-btn">
          <mat-icon>visibility</mat-icon>
          View Details
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .product-card {
        margin: 16px;
        max-width: 350px;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .product-card.hover:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }

      .product-image-container {
        width: 100%;
        height: 200px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        border-radius: 4px;
      }

      .product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .product-info {
        flex: 1;
        padding: 16px 0;
      }

      .product-title {
        margin: 0 0 8px 0;
        font-size: 1.2em;
        font-weight: 600;
        color: #333;
      }

      .product-description {
        margin: 0 0 16px 0;
        color: #666;
        font-size: 0.9em;
        line-height: 1.4;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      .product-categories {
        margin-bottom: 16px;
      }

      .category-chip {
        margin-right: 8px;
        margin-bottom: 4px;
        font-size: 0.8em;
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .product-price {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }

      .price-label {
        font-weight: 500;
        margin-right: 8px;
        color: #666;
      }

      .price-value {
        font-size: 1.3em;
        font-weight: 600;
        color: #4caf50;
      }

      mat-card-actions {
        padding: 16px;
        margin-top: auto;
      }

      .add-to-cart-btn {
        margin-right: 8px;
      }

      .add-to-cart-btn,
      .view-details-btn {
        min-width: auto;
      }

      .add-to-cart-btn mat-icon,
      .view-details-btn mat-icon {
        margin-right: 4px;
        font-size: 18px;
      }

      @media (max-width: 768px) {
        .product-card {
          margin: 8px;
          max-width: 100%;
        }

        .add-to-cart-btn,
        .view-details-btn {
          padding: 8px;
          min-width: auto;
        }

        .add-to-cart-btn mat-icon,
        .view-details-btn mat-icon {
          margin-right: 0;
        }

        .add-to-cart-btn .mat-button-wrapper,
        .view-details-btn .mat-button-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input() product!: Product;

  getImageUrl(imageFile?: string): string {
    // First try to use imageUrl if available
    if (this.product.imageUrl) {
      return this.product.imageUrl;
    }

    // If imageFile is provided, construct URL (in production this would be from a CDN or file service)
    if (imageFile) {
      return `https://via.placeholder.com/300x200/e3f2fd/1976d2?text=${encodeURIComponent(
        this.product.name
      )}`;
    }

    // Fallback to placeholder
    return `https://via.placeholder.com/300x200/e3f2fd/1976d2?text=${encodeURIComponent(
      this.product.name
    )}`;
  }

  onImageError(event: any): void {
    // Fallback to a default placeholder if image fails to load
    event.target.src = `https://via.placeholder.com/300x200/f5f5f5/999999?text=${encodeURIComponent(
      this.product.name
    )}`;
  }
}
