import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';
import { Router } from '@angular/router';
import { Footer } from '../footer/footer';

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  paymentMethod: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  img: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, Footer],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  cart: CartItem[] = [];
  total: number = 0;
  totalItems: number = 0;
  isProcessing: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  checkoutForm: CheckoutForm = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'TP. Hồ Chí Minh',
    zipCode: '70000',
    paymentMethod: 'credit-card'
  };

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.autoFillUserInfo();
      this.loadCart();
    }
  }

  // ── Tự động điền thông tin từ tài khoản ──
  autoFillUserInfo(): void {
    const authUser = this.authService.getCurrentUser();
    if (authUser) {
      this.checkoutForm.fullName = authUser.name || '';
      this.checkoutForm.email    = authUser.email || '';
    } else {
      // Fallback legacy localStorage keys
      const name  = localStorage.getItem('currentUserFullname') || localStorage.getItem('currentUser') || '';
      const email = localStorage.getItem('currentUserEmail') || '';
      if (name)  this.checkoutForm.fullName = name;
      if (email) this.checkoutForm.email    = email;
    }
  }

  loadCart() {
    this.cart = this.cartService.getCart();
    if (this.cart.length === 0) {
      this.errorMessage = '🛒 Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.';
      return;
    }
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = 0;
    this.totalItems = 0;
    this.cart.forEach(item => {
      this.total      += item.price * item.quantity;
      this.totalItems += item.quantity;
    });
  }

  validateForm(): boolean {
    if (!this.checkoutForm.fullName.trim()) {
      this.errorMessage = '❌ Vui lòng nhập tên đầy đủ'; return false;
    }
    if (!this.checkoutForm.email.trim() || !this.isValidEmail(this.checkoutForm.email)) {
      this.errorMessage = '❌ Vui lòng nhập email hợp lệ'; return false;
    }
    if (!this.checkoutForm.phone.trim()) {
      this.errorMessage = '❌ Vui lòng nhập số điện thoại'; return false;
    }
    if (!this.checkoutForm.address.trim()) {
      this.errorMessage = '❌ Vui lòng nhập địa chỉ'; return false;
    }
    if (!this.checkoutForm.city.trim()) {
      this.errorMessage = '❌ Vui lòng nhập thành phố'; return false;
    }
    if (!this.checkoutForm.zipCode.trim()) {
      this.errorMessage = '❌ Vui lòng nhập mã bưu điện'; return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async handleCheckout(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) return;

    this.isProcessing = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const order = {
        id:            Date.now(),
        customerName:  this.checkoutForm.fullName,
        email:         this.checkoutForm.email,
        phone:         this.checkoutForm.phone,
        address:       this.checkoutForm.address,
        city:          this.checkoutForm.city,
        zipCode:       this.checkoutForm.zipCode,
        paymentMethod: this.checkoutForm.paymentMethod,
        items:         this.cart,
        totalAmount:   this.total,
        totalItems:    this.totalItems,
        orderDate:     new Date().toISOString(),
        status:        'pending'
      };

      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));

      this.cartService.clearCart();
      this.successMessage = '✅ Đặt hàng thành công! Đang chuyển về trang chủ...';

      setTimeout(() => {
        this.router.navigate(['/profile']);
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      this.errorMessage = '❌ Có lỗi xảy ra. Vui lòng thử lại!';
    } finally {
      this.isProcessing = false;
    }
  }

  removeItem(index: number) {
    this.cartService.removeItem(index);
    this.loadCart();
  }

  updateQuantity(index: number, quantity: number) {
    if (quantity > 0) {
      this.cartService.updateQuantity(index, quantity);
      this.loadCart();
    }
  }
}