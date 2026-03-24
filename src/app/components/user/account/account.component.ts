import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { UserService, User } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    ToastModule, 
    InputTextModule, 
    ButtonModule, 
    FloatLabelModule
  ],
  providers: [MessageService],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class UserAccountComponent implements OnInit {
  user: User | null = null;
  isEditMode = false;
  editData = {
    name: '',
    email: '',
    phoneNumber: ''
  };

  constructor(
    private authService: AuthService, 
    private userService: UserService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        // Update localStorage to keep it in sync
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, name: profile.name, email: profile.email }));
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load profile' });
      }
    });
  }

  toggleEditMode() {
    if (this.user) {
      this.editData = {
        name: this.user.name,
        email: this.user.email,
        phoneNumber: this.user.phoneNumber || ''
      };
    }
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
  }

  onUpdate() {
    if (!this.user) return;

    this.userService.updateUser(this.user.id, this.editData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditMode = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully' });
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, name: updatedUser.name, email: updatedUser.email }));
      },
      error: (err) => {
        let errorMessage = 'Update failed';
        if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
