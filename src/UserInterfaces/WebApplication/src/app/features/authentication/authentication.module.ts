import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationComponent } from './authentication.component';

@NgModule({
  imports: [CommonModule, AuthenticationComponent],
  exports: [AuthenticationComponent],
})
export class AuthenticationModule {}
