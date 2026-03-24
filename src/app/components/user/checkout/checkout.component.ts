import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../services/address.service';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-user-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RadioButtonModule, InputTextModule, LoaderComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class UserCheckoutComponent implements OnInit {
  addresses: any[] = [];
  selectedAddressId: string = '';
  paymentMethod: string = 'COD';
  cartItems: any[] = [];
  total: number = 0;
  isLoading: boolean = false;
  
  newAddress = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  };
  showAddAddress = false;

  constructor(
    private addressService: AddressService,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.loadAddresses();
    this.loadCartData();
  }

  loadCartData() {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items || [];
      this.total = this.calculateTotal(this.cartItems);
      console.log('Cart items loaded in checkout:', this.cartItems);
      if (this.cartItems.length === 0) {
        this.router.navigate(['/cart']);
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  private calculateTotal(items: any[]): number {
    return items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  }

  goBack() {
    this.router.navigate(['/cart']);
  }

  loadAddresses() {
    this.addressService.getAddresses().subscribe(res => {
      // Handle both direct array and wrapped { value: [] } responses
      this.addresses = Array.isArray(res) ? res : ((res as any).value || []);
      console.log('Addresses loaded:', this.addresses);
      
      if (this.addresses.length > 0) {
        const defaultAddr = this.addresses.find(a => a.IsDefault || a.isDefault);
        if (defaultAddr) {
          this.selectedAddressId = defaultAddr.Id || defaultAddr.id;
        } else {
          this.selectedAddressId = this.addresses[0].Id || this.addresses[0].id;
        }
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  addAddress() {
    this.isLoading = true;
    this.addressService.createAddress(this.newAddress).subscribe(() => {
      this.loadAddresses();
      this.showAddAddress = false;
      this.newAddress = { street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false };
      this.isLoading = false;
    });
  }

  placeOrder() {
    if (!this.selectedAddressId) {
      alert('Please select or add a delivery address');
      return;
    }

    const items = this.cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    this.isLoading = true;
    this.orderService.createOrder(this.selectedAddressId, this.paymentMethod, items).subscribe({
      next: (order) => {
        this.cartService.clearCart().subscribe(() => {
          this.isLoading = false;
          this.router.navigate(['/orders']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error placing order:', err);
        alert('Error placing order: ' + err.error);
      }
    });
  }
}
