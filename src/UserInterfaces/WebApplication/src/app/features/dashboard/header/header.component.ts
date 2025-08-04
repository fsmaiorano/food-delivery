import { Component } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { Observable } from 'rxjs/internal/Observable';
import {
  AuthStoreService,
  AuthUser,
} from '../../../shared/services/auth-store.service';
import { BasketService } from '../../../shared/services/basket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  currentUser$: Observable<AuthUser | null>;
  cartItemCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private authStore: AuthStoreService,
    private basketService: BasketService
  ) {
    this.currentUser$ = this.authStore.user$;
    this.cartItemCount$ = this.basketService.getItemCount();
  }

  ngOnInit(): void {}

  onLogout(): void {
    this.authService.signOut();
    this.router.navigate(['/dashboard']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
