import { Component, EnvironmentProviders, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import {
  AuthService,
  SignInRequest,
  SignUpRequest,
} from '../../shared/services/auth.service';
import { AuthStoreService } from '../../shared/services/auth-store.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
})
export class AuthenticationComponent implements OnInit {
  signInForm: FormGroup;
  signUpForm: FormGroup;
  isSignUpMode = false;
  errorMessage = '';
  isLoading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authStore: AuthStoreService,
    private router: Router
  ) {
    this.isLoading$ = this.authStore.isLoading$;
    this.signInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.signUpForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode(): void {
    this.isSignUpMode = !this.isSignUpMode;
    this.errorMessage = '';
    this.resetForms();
  }

  onSignIn(): void {
    if (this.signInForm.valid) {
      this.errorMessage = '';

      const credentials: SignInRequest = {
        username: this.signInForm.value.username,
        password: this.signInForm.value.password,
      };

      this.authService.signIn(credentials).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
        },
      });
    }
  }

  onSignUp(): void {
    if (this.signUpForm.valid) {
      this.errorMessage = '';

      const userData: SignUpRequest = {
        username: this.signUpForm.value.username,
        email: this.signUpForm.value.email,
        firstName: this.signUpForm.value.firstName,
        lastName: this.signUpForm.value.lastName,
        password: this.signUpForm.value.password,
      };

      this.authService.signUp(userData).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          if (error.status === 401) {
            this.errorMessage = 'Account created successfully. Please sign in.';
            this.isSignUpMode = false;
            this.signInForm.patchValue({
              username: userData.username,
              password: userData.password,
            });
          } else {
            this.errorMessage = this.getErrorMessage(error);
          }
        },
      });
    }
  }

  private passwordMatchValidator(
    group: FormGroup
  ): { [key: string]: boolean } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private getErrorMessage(error: any): string {
    console.error('Authentication error:', error);

    if (error.error?.error_description) {
      return error.error.error_description;
    }
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.status === 401) {
      return 'Invalid username or password';
    }
    if (error.status === 403) {
      return 'Access forbidden. Please check your credentials and try again.';
    }
    if (error.status === 0) {
      return 'Unable to connect to authentication server. Please check if Keycloak is running.';
    }
    return `An error occurred (${error.status}): ${
      error.statusText || 'Please try again.'
    }`;
  }

  private resetForms(): void {
    this.signInForm.reset();
    this.signUpForm.reset();
  }

  get signInControls() {
    return this.signInForm.controls;
  }

  get signUpControls() {
    return this.signUpForm.controls;
  }
}
