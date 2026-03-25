import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5237/api/payment';

  constructor(private http: HttpClient) { }

  createRazorpayOrder(amount: number, receiptId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, { amount, receiptId });
  }

  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-payment`, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
  }

  initiateRazorpay(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        reject(response.error);
      });
      rzp.open();
      // Razorpay doesn't provide a promise-based open() method, 
      // so we rely on the handler in the options and the error listener above.
    });
  }
}
