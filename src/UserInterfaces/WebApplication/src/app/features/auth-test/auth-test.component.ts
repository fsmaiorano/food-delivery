import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>Authentication Test</h2>
      <button (click)="testAuth()">Test Authentication</button>
      <div *ngIf="result" [innerHTML]="result"></div>
    </div>
  `,
})
export class AuthTestComponent {
  result: string = '';

  constructor(private http: HttpClient) {}

  testAuth(): void {
    const tokenUrl =
      'http://localhost:6005/realms/myrealm/protocol/openid-connect/token';

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams({
      grant_type: 'password',
      username: 'fsmaiorano',
      password: '123456',
      client_id: 'frontend-app',
      scope: 'openid profile email',
    });

    console.log('Testing authentication...', {
      url: tokenUrl,
      headers: headers,
      body: body.toString(),
    });

    this.result = 'Testing authentication...';

    this.http.post<any>(tokenUrl, body.toString(), { headers }).subscribe({
      next: (response) => {
        console.log('Success:', response);
        this.result = `
          <div style="color: green;">
            <h3>✅ Authentication Successful!</h3>
            <p><strong>Access Token:</strong> ${response.access_token.substring(
              0,
              50
            )}...</p>
            <p><strong>Token Type:</strong> ${response.token_type}</p>
            <p><strong>Expires In:</strong> ${response.expires_in} seconds</p>
          </div>
        `;
      },
      error: (error) => {
        console.error('Error:', error);
        this.result = `
          <div style="color: red;">
            <h3>❌ Authentication Failed!</h3>
            <p><strong>Status:</strong> ${error.status} ${error.statusText}</p>
            <p><strong>Message:</strong> ${
              error.error?.error_description || error.message
            }</p>
            <p><strong>URL:</strong> ${error.url}</p>
            <pre>${JSON.stringify(error.error, null, 2)}</pre>
          </div>
        `;
      },
    });
  }
}
