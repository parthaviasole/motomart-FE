import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../services/auth';
import { AutoUnsubscribeComponent } from '../auto-unsubscribe/auto-unsubscribe.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    FloatLabelModule,
    PasswordModule
  ],
  templateUrl: './reset-password.component.html',
  providers: [MessageService, AuthService]
})
export class ResetPasswordComponent extends AutoUnsubscribeComponent implements OnInit {
  resetData = { token: '', newPassword: '', confirmPassword: '' };
  loading: boolean = false;

  constructor(
    private authService: AuthService, 
    private messageService: MessageService, 
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.queryParams
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(params => {
      this.resetData.token = params['token'];
    });
  }

  onSubmit() {
    this.loading = true;
    this.authService.resetPassword(this.resetData)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password has been reset successfully.' });
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'An error occurred.' });
        this.loading = false;
      }
    });
  }
}