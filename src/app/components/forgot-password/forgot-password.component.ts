import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AuthService } from '../../services/auth';
import { AutoUnsubscribeComponent } from '../auto-unsubscribe/auto-unsubscribe.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    FloatLabelModule
  ],
  templateUrl: './forgot-password.component.html',
  providers: [MessageService, AuthService]
})
export class ForgotPasswordComponent extends AutoUnsubscribeComponent {
  email: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private messageService: MessageService) {
    super();
  }

  onSubmit() {
    this.loading = true;
    this.authService.forgotPassword(this.email)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password reset link sent to your email.' });
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'An error occurred.' });
        this.loading = false;
      }
    });
  }
}