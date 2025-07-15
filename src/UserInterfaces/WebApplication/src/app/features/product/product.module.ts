import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductCardComponent } from './product-card/product-card.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, ProductDetailsComponent, ProductCardComponent],
  exports: [ProductDetailsComponent, ProductCardComponent],
})
export class ProductModule {}
