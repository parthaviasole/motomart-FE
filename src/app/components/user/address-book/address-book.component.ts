import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AddressService, Address, AddressCreateDto } from '../../../services/address.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './address-book.component.html',
  styleUrl: './address-book.component.css'
})
export class AddressBookComponent implements OnInit {
  addresses: Address[] = [];
  displayDialog = false;
  isEditMode = false;
  loading = false;
  currentAddressId: string | null = null;

  addressData: AddressCreateDto = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  };

  constructor(
    private addressService: AddressService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.loading = true;
    console.log('Loading addresses started...');
    this.addressService.getAddresses().pipe(
      finalize(() => {
        this.loading = false;
        console.log('Loading addresses finalized. Loading state:', this.loading);
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        console.log('Data received in component:', res);
        this.addresses = Array.isArray(res) ? res : (res.value || []);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Detailed error in component:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load addresses' });
      }
    });
  }

  showAddDialog() {
    this.isEditMode = false;
    this.currentAddressId = null;
    this.addressData = {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    };
    this.displayDialog = true;
  }

  editAddress(address: Address) {
    this.isEditMode = true;
    this.currentAddressId = address.id;
    this.addressData = {
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    };
    this.displayDialog = true;
  }

  deleteAddress(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this address?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-plain',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.addressService.deleteAddress(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Address deleted' });
            this.loadAddresses();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete address' });
          }
        });
      }
    });
  }

  setDefault(id: string) {
    this.addressService.setDefaultAddress(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Default address updated' });
        this.loadAddresses();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update default address' });
      }
    });
  }

  saveAddress() {
    this.loading = true;
    if (this.isEditMode && this.currentAddressId) {
      this.addressService.updateAddress(this.currentAddressId, this.addressData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Address updated' });
          this.displayDialog = false;
          this.loading = false;
          this.loadAddresses();
        },
        error: () => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update address' });
        }
      });
    } else {
      this.addressService.createAddress(this.addressData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Address added' });
          this.displayDialog = false;
          this.loading = false;
          this.loadAddresses();
        },
        error: () => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add address' });
        }
      });
    }
  }
}
