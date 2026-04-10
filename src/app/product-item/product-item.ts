import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

// Danh sách fallback images có sẵn trong media folder
const FALLBACK_IMAGES = [
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

@Component({
  selector: 'app-product-item',
  imports: [CommonModule],
  templateUrl: './product-item.html',
  styleUrl: './product-item.css',
})
export class ProductItemComponent {
  // Input: Nhận dữ liệu sản phẩm từ component cha (products-list)
  @Input() product: any;
  
  // Input: Kiểm soát cách load ảnh - 'lazy' (chậm khi scroll) hoặc 'eager' (load ngay)
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  
  // Output: Phát sự kiện khi người dùng click "Thêm giỏ"
  @Output() addToCart = new EventEmitter<any>();
  
  // Output: Phát sự kiện khi người dùng click "Xem chi tiết"
  @Output() viewProduct = new EventEmitter<number>();

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Hàm lựa chọn ảnh dự phòng khi ảnh chính không tồn tại
  // Dùng product.id để chọn ảnh cố định (cùng sản phẩm luôn dùng ảnh dự phòng giống nhau)
  private getFallbackImage(): string {
    const productId = this.product?.id || Math.random();
    // Dùng modulo (%) để xoay vòng trong array FALLBACK_IMAGES
    const index = (productId % FALLBACK_IMAGES.length);
    return FALLBACK_IMAGES[index];
  }

  // Lấy URL ảnh sản phẩm - kiểm tra nhiều field vì db có thể không đồng nhất
  // Ưu tiên: Images > images > image > thumbnail > ảnh dự phòng
  getImageUrl(): string {
    const p = this.product;
    // Nếu không có sản phẩm, dùng ảnh dự phòng
    if (!p) return this.getFallbackImage();

    // Kiểm tra Images (chữ hoa) dạng string
    if (typeof p.Images === 'string' && p.Images.length > 0) return p.Images;

    // Kiểm tra Images dạng array, lấy phần tử đầu tiên
    if (Array.isArray(p.Images) && p.Images.length > 0) return p.Images[0];

    // Kiểm tra images (chữ thường) dạng string
    if (typeof p.images === 'string' && p.images.length > 0) return p.images;
    // Kiểm tra images dạng array, lấy phần tử đầu tiên
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];

    // Kiểm tra field ảnh khác (image, thumbnail)
    if (p.image)     return p.image;
    if (p.thumbnail) return p.thumbnail;

    // Nếu không tìm thấy, dùng ảnh dự phòng
    return this.getFallbackImage();
  }

  // Xử lý khi click nút "Thêm giỏ"
  // Phát sự kiện addToCart kèm dữ liệu sản phẩm để component cha xử lý
  onAddToCart() {
    this.addToCart.emit(this.product);
  }

  // Xử lý khi click nút "Xem chi tiết"
  // Điều hướng đến trang viewdetail với product id dạng query parameter
  // isPlatformBrowser: Kiểm tra chỉ chạy trên browser, không chạy trên server (SSR)
  onViewProduct() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/viewdetail'], {
        queryParams: { id: this.product.id }
      });
    }
  }

  // Xử lý khi ảnh không load được (link bị hỏng)
  // Thay thế bằng ảnh dự phòng từ folder media
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    // Kiểm tra: nếu ảnh hiện tại không phải media/ thì mới thay dự phòng
    // Điều này tránh vòng lặp vô tận nếu ảnh dự phòng cũng lỗi
    if (!img.src.includes('media/')) {
      img.src = this.getFallbackImage();
    }
  }

  // ============ CÁC HÀM TÍNH GIÁ VÀ GIẢM GIÁ ============
  
  // Kiểm tra sản phẩm có đang giảm giá không
  // Điều kiện: có discount > 0 HOẶC có sale_price nhỏ hơn price
  isOnSale(): boolean {
    if (!this.product) return false;
    const discount = this.product.discount || 0;
    // Kiểm tra có discount (%)  
    const hasDiscount = discount > 0;
    // Kiểm tra có sale_price nhỏ hơn price
    const hasSalePrice = this.product.sale_price && this.product.sale_price < this.product.price;
    // Nếu có một trong hai điều kiện thì là đang giảm giá
    return hasDiscount || hasSalePrice;
  }

  // Tính giá sau khi giảm
  // Công thức: giá bán = giá gốc - (giá gốc × phần trăm giảm / 100)
  getSalePrice(): number {
    if (!this.product) return 0;
    const price = this.product.price || 0;
    const discount = this.product.discount || 0;
    // Nếu có discount (%), tính giá sau giảm
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    // Nếu không có discount, kiểm tra sale_price, nếu không thì dùng giá gốc
    return this.product.sale_price || price;
  }

  // Lấy phần trăm giảm giá
  // Giá trị trả về là số (ví dụ: 10 = 10%)
  getDiscountPercentage(): number {
    if (!this.product) return 0;
    return this.product.discount || 0;
  }

  // Tính số tiền tiết kiệm
  // Công thức: tiền tiết kiệm = giá gốc - giá sau giảm
  // Hiển thị cho người dùng biết tiết kiệm được bao nhiêu
  getSavings(): number {
    if (!this.product) return 0;
    const originalPrice = this.product.price || 0;
    const salePrice = this.getSalePrice();
    return originalPrice - salePrice;
  }

  // Chuyển đổi tên category thành nhãn hiển thị với emoji
  // category = 'classic' → '🏛️ Cổ điển'
  // category = 'modern' → '🚀 Hiện đại'
  // ... v.v
  getCategoryLabel(): string {
    if (!this.product || !this.product.category) return '';
    switch (this.product.category) {
      case 'classic':
        return '🏛️ Cổ điển';  // Xe cổ điển
      case 'modern':
        return '🚀 Hiện đại';  // Xe hiện đại
      case 'grand-tourer':
        return '🛣️ Grand Tourer';  // Xe dành cho hành trình dài
      case 'hypercar':
        return '⚡ Hypercar';  // Siêu xe đặc biệt
      default:
        return this.product.category;  // Nếu không khớp, trả về category như cũ
    }
  }
}