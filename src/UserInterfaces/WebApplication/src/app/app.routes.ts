import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductDetailsComponent } from './features/product/product-details/product-details.component';
import { AuthenticationComponent } from './features/authentication/authentication.component';
import { AuthTestComponent } from './features/auth-test/auth-test.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: AuthenticationComponent,
  },
  {
    path: 'auth-test',
    component: AuthTestComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products/:id',
    component: ProductDetailsComponent,
    canActivate: [AuthGuard],
  },
];
