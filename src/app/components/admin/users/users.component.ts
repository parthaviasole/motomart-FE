import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../../services/user.service';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    FormsModule, 
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class AdminUsersComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  users: User[] = [];
  totalRecords = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;
  loading = true;
  searchTerm: string = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {}

  loadUsers(event: any) {
    this.loading = true;
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;

    this.userService.getUsers(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.users = res?.items || [];
          this.totalRecords = res?.totalCount || 0;
          this.totalPages = res?.totalPages || 0;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.table.onLazyLoad.emit({
      first: 0,
      rows: this.pageSize
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.table.onLazyLoad.emit({
      first: (page - 1) * this.pageSize,
      rows: this.pageSize
    });
  }

  changePageSize(newSize: number) {
    this.pageSize = newSize;
    this.table.onLazyLoad.emit({
      first: 0,
      rows: this.pageSize
    });
  }

  getPagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
