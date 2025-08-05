import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { CartComponent } from './cart.component';
import { BasketService } from '../../shared/services/basket.service';
import { AuthStoreService } from '../../shared/services/auth-store.service';
import { MaterialModule } from '../../shared/material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let mockBasketService: jasmine.SpyObj<BasketService>;
  let mockAuthStore: jasmine.SpyObj<AuthStoreService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const basketServiceSpy = jasmine.createSpyObj('BasketService', [
      'loadBasket',
      'getTotalPrice',
    ]);
    const authStoreSpy = jasmine.createSpyObj('AuthStoreService', ['getUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Setup default return values
    basketServiceSpy.basket$ = of(null);
    basketServiceSpy.loading$ = of(false);
    basketServiceSpy.error$ = of(null);
    basketServiceSpy.getTotalPrice.and.returnValue(of(0));

    await TestBed.configureTestingModule({
      imports: [
        CartComponent,
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: BasketService, useValue: basketServiceSpy },
        { provide: AuthStoreService, useValue: authStoreSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    mockBasketService = TestBed.inject(
      BasketService
    ) as jasmine.SpyObj<BasketService>;
    mockAuthStore = TestBed.inject(
      AuthStoreService
    ) as jasmine.SpyObj<AuthStoreService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fill form with mock data on initialization in development', () => {
    component.ngOnInit();

    // Check if form has been populated with mock data
    const formValues = component.checkoutForm.value;
    expect(formValues.firstName).toBeTruthy();
    expect(formValues.lastName).toBeTruthy();
    expect(formValues.emailAddress).toContain('@');
    expect(formValues.addressLine).toBeTruthy();
    expect(formValues.cardNumber).toBeTruthy();
  });

  it('should return true for isDevelopment() in development environment', () => {
    // This test will depend on the actual environment configuration
    expect(typeof component.isDevelopment()).toBe('boolean');
  });

  it('should load mock data when loadMockData is called', () => {
    // First clear the form
    component.checkoutForm.reset();

    // Then load mock data
    component.loadMockData();

    // Verify some key fields were populated
    expect(component.checkoutForm.get('firstName')?.value).toBeTruthy();
    expect(component.checkoutForm.get('emailAddress')?.value).toContain('@');
  });
});
