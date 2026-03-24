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
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent extends AutoUnsubscribeComponent {
  loginData = {
    email: '',
    password: ''
  };
  loading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private messageService: MessageService
  ) {
    super();
  }

  onLogin() {
    this.loading = true;
    this.authService.login(this.loginData)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Login successful' });
        setTimeout(() => {
          if (res.role === 'Admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1000);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Invalid credentials' });
        this.loading = false;
      }
    });
  }
}
