import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../services/address.service';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-user-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RadioButtonModule, InputTextModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class UserCheckoutComponent implements OnInit {
  addresses: any[] = [];
  selectedAddressId: string = '';
  paymentMethod: string = 'COD';
  cartItems: any[] = [];
  total: number = 0;
  
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
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAddresses();
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getCartTotal();
      if (this.cartItems.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  loadAddresses() {
    this.addressService.getAddresses().subscribe(res => {
      // Handle both direct array and wrapped { value: [] } responses
      this.addresses = Array.isArray(res) ? res : ((res as any).value || []);
      
      const defaultAddr = this.addresses.find(a => a.IsDefault || a.isDefault);
      if (defaultAddr) {
        this.selectedAddressId = defaultAddr.Id || defaultAddr.id;
      } else if (this.addresses.length > 0) {
        this.selectedAddressId = this.addresses[0].Id || this.addresses[0].id;
      }
    });
  }

  addAddress() {
    this.addressService.createAddress(this.newAddress).subscribe(() => {
      this.loadAddresses();
      this.showAddAddress = false;
      this.newAddress = { street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false };
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

    this.orderService.createOrder(this.selectedAddressId, this.paymentMethod, items).subscribe({
      next: (order) => {
        this.cartService.clearCart().subscribe(() => {
          this.router.navigate(['/orders']);
        });
      },
      error: (err) => {
        alert('Error placing order: ' + err.error);
      }
    });
  }
}
