import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent {
  @Input() categories: string[] = [];
  @Input() selectedCategory: string = '';
  @Input() loading: boolean = false;
  @Input() products: any[] = [];
  @Input() totalCount: number = 0;

  @Output() categoryChange = new EventEmitter<string>();
  @Output() clearFilter = new EventEmitter<void>();

  onCategoryChange(category: string): void {
    this.categoryChange.emit(category);
  }

  clearCategoryFilter(): void {
    this.clearFilter.emit();
  }
}
