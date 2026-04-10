import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { Footer } from '../footer/footer';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  Images?: any;
  image?: string;
  images?: any;
  video?: string;
}

interface Review {
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  username: string;
  userEmail: string;
}

@Component({
  selector: 'app-viewdetail',
  standalone: true,
  imports: [CommonModule, FormsModule, Footer],
  templateUrl: './viewdetail.html',
  styleUrl: './viewdetail.css',
})
export class Viewdetail implements OnInit {
  product: Product | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  quantity: number = 1;

  // ── Wishlist ──
  isWishlisted: boolean = false;

  // ── Reviews ──
  reviews: Review[] = [];
  showReviewForm: boolean = false;
  newRating: number = 0;
  hoverRating: number = 0;
  newComment: string = '';
  reviewSuccess: string = '';
  reviewError: string = '';
  isSubmittingReview: boolean = false;

  private fallbackImages = [
    'media/sf90.1.jpg',
    'media/sf90.2.jpg',
    'media/sf90.3.jpg',
    'media/sf90.4.jpg',
    'media/1987-Ferrari-F40-004.jpg',
    'media/2003-Ferrari-Enzo1383682_.webp',
    'media/2020-Ferrari-F8-Tributo-007-1600.jpg',
    'media/dean_smith-enzo_laf-130.jpg',
    'media/ferrari-488-gtb-car-red-cars-wallpaper-preview.jpg',
    'media/red-car-car-luxury-vehicle-red-wallpaper-preview.jpg',
    'media/red-lights-ferrari-ferrari-the-bridge-hd-wallpaper-preview.jpg',
    'media/pexels-alessandro-carrarini-31300621-12576612.jpg',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProductDetail();
    }
  }

  private async loadProductDetail() {
    this.isLoading = true;
    try {
      let productId: any = this.route.snapshot.queryParams['id'];
      if (!productId) productId = this.route.snapshot.paramMap.get('id');

      if (!productId) {
        this.errorMessage = '❌ Không tìm thấy ID sản phẩm. URL phải có ?id=NUMBER';
        return;
      }

      let product = await this.apiService.getProductById(productId);
      if (!product) {
        await new Promise(resolve => setTimeout(resolve, 500));
        product = await this.apiService.getProductById(productId);
      }

      if (!product) {
        this.errorMessage = '❌ Sản phẩm không tồn tại';
      } else {
        this.product = product;
        this.errorMessage = '';
        this.loadWishlistState();
        this.loadReviews();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      this.errorMessage = '❌ Lỗi khi tải sản phẩm. Vui lòng thử lại!';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ══════════════════════════════════
  // WISHLIST
  // ══════════════════════════════════

  loadWishlistState(): void {
    if (!this.product) return;
    try {
      const wishlist: any[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
      this.isWishlisted = wishlist.some(w => w.id === this.product!.id);
    } catch { this.isWishlisted = false; }
  }

  toggleWishlist(): void {
    if (!this.product) return;
    try {
      const wishlist: any[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const idx = wishlist.findIndex(w => w.id === this.product!.id);

      if (idx >= 0) {
        // Đã có → xóa
        wishlist.splice(idx, 1);
        this.isWishlisted = false;
      } else {
        // Chưa có → thêm
        wishlist.push({
          id:    this.product.id,
          name:  this.product.name,
          price: this.product.price,
          img:   this.getImageUrl(),
        });
        this.isWishlisted = true;
      }
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch {}
  }

  // ══════════════════════════════════
  // REVIEWS
  // ══════════════════════════════════

  loadReviews(): void {
    if (!this.product) return;
    try {
      const all: Review[] = JSON.parse(localStorage.getItem('reviews') || '[]');
      this.reviews = all
        .filter(r => r.productId === this.product!.id)
        .reverse();
    } catch { this.reviews = []; }
  }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    return this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length;
  }

  getStarsDisplay(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => {
      const val = i + 1;
      if (val <= Math.floor(rating)) return 'full';
      if (val - 0.5 <= rating)       return 'half';
      return 'empty';
    });
  }

  setRating(star: number): void { this.newRating = star; }
  setHover(star: number): void  { this.hoverRating = star; }
  clearHover(): void            { this.hoverRating = 0; }

  getStarClass(star: number): string {
    const active = this.hoverRating || this.newRating;
    return star <= active ? 'star active' : 'star';
  }

  submitReview(): void {
    this.reviewError = '';
    this.reviewSuccess = '';

    if (this.newRating === 0) {
      this.reviewError = '❌ Vui lòng chọn số sao đánh giá!';
      return;
    }
    if (!this.newComment.trim() || this.newComment.trim().length < 5) {
      this.reviewError = '❌ Nhận xét cần ít nhất 5 ký tự!';
      return;
    }

    this.isSubmittingReview = true;

    // Lấy thông tin user
    let username = 'Khách';
    let userEmail = '';
    try {
      const authRaw = localStorage.getItem('ferrariAuth');
      if (authRaw) {
        const user = JSON.parse(authRaw)?.user;
        if (user) { username = user.name || user.email?.split('@')[0] || 'Khách'; userEmail = user.email || ''; }
      } else {
        username  = localStorage.getItem('currentUserFullname') || localStorage.getItem('currentUser') || 'Khách';
        userEmail = localStorage.getItem('currentUserEmail') || '';
      }
    } catch {}

    const review: Review = {
      productId:   this.product!.id,
      productName: this.product!.name,
      rating:      this.newRating,
      comment:     this.newComment.trim(),
      date:        new Date().toLocaleDateString('vi-VN'),
      username,
      userEmail,
    };

    setTimeout(() => {
      try {
        const all: Review[] = JSON.parse(localStorage.getItem('reviews') || '[]');
        all.push(review);
        localStorage.setItem('reviews', JSON.stringify(all));
        this.loadReviews();
        this.reviewSuccess = '✅ Cảm ơn bạn đã đánh giá!';
        this.newRating = 0;
        this.newComment = '';
        this.showReviewForm = false;
        setTimeout(() => this.reviewSuccess = '', 4000);
      } catch {
        this.reviewError = '❌ Lỗi lưu đánh giá. Vui lòng thử lại!';
      } finally {
        this.isSubmittingReview = false;
      }
    }, 600);
  }

  // ══════════════════════════════════
  // CART
  // ══════════════════════════════════

  addToCart() {
    if (!this.product) return;
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.product);
    }
    alert(`✅ Thêm ${this.quantity} sản phẩm vào giỏ hàng thành công!`);
    this.quantity = 1;
  }

  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { if (this.quantity > 1) this.quantity--; }
  goBack()           { this.router.navigate(['/shop']); }

  // ══════════════════════════════════
  // IMAGE
  // ══════════════════════════════════

  getImageUrl(): string {
    if (!this.product) return this.getFallbackImage();
    const p = this.product;
    if (typeof p.Images === 'string' && p.Images.length > 0) return p.Images;
    if (Array.isArray(p.Images) && p.Images.length > 0) return p.Images[0];
    if (typeof p.images === 'string' && p.images.length > 0) return p.images;
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
    if (p.image) return p.image;
    return this.getFallbackImage();
  }

  private getFallbackImage(): string {
    if (!this.product) return this.fallbackImages[0];
    return this.fallbackImages[this.product.id % this.fallbackImages.length];
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('media/')) img.src = this.getFallbackImage();
  }
}
