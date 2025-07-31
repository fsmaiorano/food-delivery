import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SignUpRequest } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  private readonly keycloakUrl = environment.keycloakUrl;
  private readonly realm = 'myrealm';

  constructor(private http: HttpClient) {}

  registerUser(userData: SignUpRequest): Observable<any> {
    // In a real implementation, you would need to:
    // 1. Have admin credentials or use Keycloak's user registration endpoint
    // 2. Use Keycloak Admin REST API to create users
    // 3. Handle email verification if required

    // For demonstration purposes, we'll simulate a successful registration
    // In practice, you might want to:
    // - Send this to your backend API which has admin privileges
    // - Use Keycloak's user registration feature if enabled
    // - Implement custom user registration flow

    console.log('Registering user:', userData);

    // Simulate API call delay
    return of({
      success: true,
      message: 'User registered successfully',
      userId: Math.random().toString(36).substr(2, 9),
    });
  }

  // Alternative method if you have admin credentials
  createUserWithAdmin(
    userData: SignUpRequest,
    adminToken: string
  ): Observable<any> {
    const createUserUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;

    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    };

    const userPayload = {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      enabled: true,
      emailVerified: true,
      credentials: [
        {
          type: 'password',
          value: userData.password,
          temporary: false,
        },
      ],
    };

    return this.http.post(createUserUrl, userPayload, { headers });
  }
}
