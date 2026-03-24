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

  totalCount: number = 0;
  totalPages: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;

  users: User[] = [];
  totalRecords = 0;
  pagesArray: number[] = [];
  currentPage = 1;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {}

  loadUsers(event: any) {
      if (event) {
      this.pageNumber = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }

    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.users = res?.items || [];
          this.totalCount = res.totalCount || res.totalCount || 0;
          this.totalPages = res.totalPages || res.totalPages || 0;
          this.updatePagesArray();
          this.cdr.markForCheck();
        });
      },
      error: () => {
        setTimeout(() => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
          this.cdr.markForCheck();
        });
      }
    });
  }

  updatePagesArray() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    this.pagesArray = pages;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    setTimeout(() => {
      this.table.onLazyLoad.emit({
        first: (page - 1) * this.pageSize,
        rows: this.pageSize
      });
    });
  }

  changePageSize(newSize: number) {
    this.pageSize = newSize;
    setTimeout(() => {
      this.table.onLazyLoad.emit({
        first: 0,
        rows: this.pageSize
      });
    });
  }
}
