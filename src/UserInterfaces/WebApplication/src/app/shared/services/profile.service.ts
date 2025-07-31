import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly keycloakUrl = environment.keycloakUrl;
  private readonly realm = 'myrealm';

  constructor(private http: HttpClient) {}

  updateProfile(profileData: UpdateProfileRequest): Observable<any> {
    // In a real implementation, you would need to:
    // 1. Use Keycloak Admin API to update user profile
    // 2. Require admin privileges or use a backend service
    // 3. Update the user information in Keycloak

    console.log('Profile update request:', profileData);

    // Simulate API call
    return of({
      success: true,
      message: 'Profile updated successfully',
      data: profileData,
    });
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    // In a real implementation, you would:
    // 1. Use Keycloak's password change endpoint
    // 2. Verify current password
    // 3. Update to new password

    console.log('Password change request for current user');

    // Simulate API call
    return of({
      success: true,
      message: 'Password changed successfully',
    });
  }

  // For real implementation with Keycloak Admin API
  updateUserWithAdmin(
    userId: string,
    profileData: UpdateProfileRequest,
    adminToken: string
  ): Observable<any> {
    const updateUserUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    });

    const userPayload = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      emailVerified: true,
    };

    return this.http.put(updateUserUrl, userPayload, { headers });
  }

  // For real implementation with Keycloak Account API
  changePasswordWithAccount(
    passwordData: ChangePasswordRequest,
    token: string
  ): Observable<any> {
    const changePasswordUrl = `${this.keycloakUrl}/realms/${this.realm}/account/credentials/password`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const passwordPayload = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    };

    return this.http.put(changePasswordUrl, passwordPayload, { headers });
  }
}
