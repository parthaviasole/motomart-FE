import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AutoUnsubscribeComponent } from '../auto-unsubscribe/auto-unsubscribe.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    CardModule, 
    InputTextModule, 
    PasswordModule, 
    ButtonModule,
    ToastModule,
    FloatLabelModule
  ],
  providers: [MessageService],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent extends AutoUnsubscribeComponent {
  registerData = {
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  };
  loading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private messageService: MessageService
  ) {
    super();
  }

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match' });
      return;
    }

    this.loading = true;
    this.authService.register(this.registerData)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Registration successful' });
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        let errorMessage = 'Registration failed';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.errors) {
            // Handle validation errors from ASP.NET Core
            errorMessage = Object.values(err.error.errors).flat().join(', ');
          }
        }
        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
        this.loading = false;
      }
    });
  }
}
