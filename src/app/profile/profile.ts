import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Footer } from '../footer/footer';
import { AuthService } from '../services/auth.service';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  img: string;
}

export interface Order {
  id?: string | number;
  customerName?: string;
  customer?: string;
  email?: string;
  total?: number;
  totalAmount?: number;
  status?: string;
  date?: string;
  orderDate?: string;
  items?: OrderItem[];
}

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  img?: string;
  image?: string;
}

export interface Review {
  productId?: number;
  productName?: string;
  rating?: number;
  comment?: string;
  date?: string;
  userEmail?: string;
  username?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Footer],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  username = '';
  fullname = '';
  email = '';
  joinDate = '';

  activeTab: 'info' | 'orders' | 'wishlist' | 'reviews' = 'info';

  orders: Order[] = [];
  wishlist: WishlistItem[] = [];
  reviews: Review[] = [];

  isEditing = false;
  isSaving = false;
  saveSuccess = false;
  saveError = '';

  editForm = new FormGroup({
    fullname: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  isChangingPassword = false;
  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });
  passwordError = '';
  passwordSuccess = false;

  readonly statusMap: Record<string, { label: string; color: string; icon: string }> = {
    pending:   { label: 'Chờ xử lý',   color: '#f59e0b', icon: '⏳' },
    confirmed: { label: 'Đã xác nhận', color: '#3b82f6', icon: '✅' },
    shipping:  { label: 'Đang giao',   color: '#8b5cf6', icon: '🚚' },
    delivered: { label: 'Đã giao',     color: '#10b981', icon: '🎉' },
    cancelled: { label: 'Đã hủy',      color: '#ef4444', icon: '❌' },
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const authUser = this.authService.getCurrentUser();
    if (authUser) {
      this.username = authUser.name || authUser.email?.split('@')[0] || '';
      this.fullname = authUser.name || '';
      this.email    = authUser.email || '';
      this.joinDate = (authUser as any).createdAt || this.getTodayDate();
    } else {
      this.username = localStorage.getItem('currentUser') ?? '';
      this.fullname = localStorage.getItem('currentUserFullname') ?? this.username;
      this.email    = localStorage.getItem('currentUserEmail') ?? '';
      this.joinDate = localStorage.getItem('currentUserJoinDate') ?? this.getTodayDate();
      if (!localStorage.getItem('currentUserJoinDate')) {
        localStorage.setItem('currentUserJoinDate', this.joinDate);
      }
    }

    this.editForm.patchValue({ fullname: this.fullname, email: this.email });
    this.loadOrders();
    this.loadWishlist();
    this.loadReviews();
  }

  loadOrders(): void {
    try {
      const raw: any[] = JSON.parse(localStorage.getItem('orders') || '[]');
      const userEmail = this.email.toLowerCase();
      this.orders = raw
        .filter(o => !userEmail || (o.email || '').toLowerCase() === userEmail || userEmail === '')
        .map(o => ({
          ...o,
          customer: o.customerName || o.customer || 'N/A',
          total:    o.totalAmount  || o.total    || 0,
          date:     o.orderDate
                      ? new Date(o.orderDate).toLocaleDateString('vi-VN')
                      : (o.date || 'N/A'),
          status:   o.status || 'pending',
        }))
        .reverse();
    } catch { this.orders = []; }
  }

  loadWishlist(): void {
    try {
      const key = `wishlist_${this.username || this.email}`;
      const global: WishlistItem[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const personal: WishlistItem[] = JSON.parse(localStorage.getItem(key) || '[]');
      const all = [...global, ...personal];
      const seen = new Set<number>();
      this.wishlist = all.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    } catch { this.wishlist = []; }
  }

  loadReviews(): void {
    try {
      const key = `reviews_${this.username || this.email}`;
      const global: Review[] = JSON.parse(localStorage.getItem('reviews') || '[]');
      const personal: Review[] = JSON.parse(localStorage.getItem(key) || '[]');
      const userEmail = this.email.toLowerCase();
      const fromGlobal = global.filter(r =>
        (r.userEmail || '').toLowerCase() === userEmail ||
        (r.username  || '').toLowerCase() === this.username.toLowerCase()
      );
      this.reviews = [...fromGlobal, ...personal].reverse();
    } catch { this.reviews = []; }
  }

  removeFromWishlist(index: number): void {
    const item = this.wishlist[index];
    this.wishlist.splice(index, 1);
    try {
      const key = `wishlist_${this.username || this.email}`;
      ['wishlist', key].forEach(k => {
        const arr: WishlistItem[] = JSON.parse(localStorage.getItem(k) || '[]');
        localStorage.setItem(k, JSON.stringify(arr.filter(w => w.id !== item.id)));
      });
    } catch {}
  }

  getStatusInfo(status: string): { label: string; color: string; icon: string } {
    return this.statusMap[status] || { label: status || 'N/A', color: '#6b7280', icon: '❓' };
  }

  setTab(tab: 'info' | 'orders' | 'wishlist' | 'reviews'): void {
    this.activeTab = tab;
    if (tab === 'orders')   this.loadOrders();
    if (tab === 'wishlist') this.loadWishlist();
    if (tab === 'reviews')  this.loadReviews();
  }

  private getTodayDate(): string {
    return new Date().toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  get avatarInitial(): string {
    return (this.fullname || this.username).charAt(0).toUpperCase();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.saveSuccess = false;
    this.saveError = '';
    if (this.isEditing) {
      this.editForm.patchValue({ fullname: this.fullname, email: this.email });
    }
  }

  saveProfile(): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;
    this.isSaving = true;
    this.saveError = '';
    const { fullname, email } = this.editForm.value;
    setTimeout(() => {
      localStorage.setItem('currentUserFullname', fullname ?? '');
      localStorage.setItem('currentUserEmail', email ?? '');
      this.fullname = fullname ?? '';
      this.email = email ?? '';
      this.isSaving = false;
      this.saveSuccess = true;
      this.isEditing = false;
      setTimeout(() => this.saveSuccess = false, 3000);
    }, 600);
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordError = '';
    this.passwordSuccess = false;
    this.passwordForm.reset();
  }

  changePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.passwordError = 'Mật khẩu xác nhận không khớp.';
      return;
    }
    this.isSaving = true;
    setTimeout(() => {
      this.passwordSuccess = true;
      this.passwordError = '';
      this.isSaving = false;
      this.passwordForm.reset();
      setTimeout(() => { this.passwordSuccess = false; this.isChangingPassword = false; }, 2500);
    }, 700);
  }

  logout(): void {
    this.authService.logout();
    if (isPlatformBrowser(this.platformId)) {
      ['isLoggedIn','currentUser','currentUserFullname','currentUserEmail','currentUserJoinDate']
        .forEach(k => localStorage.removeItem(k));
    }
    this.router.navigate(['/']);
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getItemImage(item: WishlistItem): string {
    return item.img || item.image || 'media/sf90.1.jpg';
  }

  f(name: string)  { return this.editForm.get(name); }
  pf(name: string) { return this.passwordForm.get(name); }
}
