// ========================================
// Cart Component - Trang xem giỏ hàng
// ========================================
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, Footer],
  template: `
    <div class="cart-container">
      <h2>Shopping Cart</h2>
      <div id="giohang" class="cart-items"></div>
    </div>
    <app-footer></app-footer>
  `,
  styleUrl: './cart1.css'
})
// CartComponent - Hiển thị danh sách sản phẩm trong giỏ hàng
// Cho phép thay đổi số lượng, xóa sản phẩm, xóa toàn bộ giỏ, thanh toán
export class CartComponent implements OnInit {
  // Constructor - Tiêm CartService và kiểm tra môi trường
  constructor(
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Angular lifecycle: Chạy sau khi component khởi tạo
  ngOnInit() {
    // Chỉ chạy trên browser (không chạy trên server SSR)
    if (isPlatformBrowser(this.platformId)) {
      // Đăng ký các hàm global TRƯỚC khi render
      // Để các onclick trong innerHTML hoạt động ngay
      this.setupGlobalFunctions();
      this.renderCart();  // Hiển thị giỏ hàng
    }
  }

  // Hàm render (vẽ) giỏ hàng ra HTML
  // Lấy dữ liệu từ CartService rồi tạo HTML string
  private renderCart() {
    const cartContainer = document.getElementById('giohang');
    if (!cartContainer) return;

    // Lấy danh sách sản phẩm trong giỏ
    const cart = this.cartService.getCart();

    // Nếu giỏ trống, hiển thị thông báo
    if (cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="cart-empty fade-in">
          <h2>Your cart is empty 😢</h2>
          <a href="/" class="btn">← Back to Shop</a>
        </div>
      `;
      return;
    }

    // Tính tổng tiền và số lượng sản phẩm
    let total = 0;
    let totalItems = 0;
    let html = '';

    // Lặp qua từng sản phẩm trong giỏ
    cart.forEach((item: any, index: number) => {
      // Hỗ trợ nhiều tên field ảnh từ API khác nhau
      const imageUrl =
        (Array.isArray(item.images) ? item.images[0] : null) ||   // images (chữ thường)
        (Array.isArray(item.Images) ? item.Images[0] : null) ||   // Images (chữ hoa)
        item.image ||          // image (đơn)
        item.img ||            // img (tên khác)
        item.Images ||         // Images string
        item.thumbnail ||      // thumbnail
        'media/sf90.1.jpg';    // ảnh fallback mặc định

      // Tính tổng giá cho sản phẩm này (giá × số lượng)
      const subtotal = item.price * item.quantity;
      total += subtotal;
      totalItems += item.quantity;

      // Xây dựng HTML cho một sản phẩm trong giỏ
      html += `
        <div class="cart-item fade-in">
          <span>
            <img
              src="${imageUrl}"
              width="80"
              style="border-radius:8px; object-fit:cover;"
              onerror="this.src='media/sf90.1.jpg'"
            >
          </span>
          <span>${item.name}</span>
          <span>${Number(item.price).toLocaleString('en-US')} USD</span>
          <span>
            <input
              type="number"
              min="1"
              value="${item.quantity}"
              onchange="updateQuantity(${index}, this.value)"
              style="width:60px;"
            >
          </span>
          <span>${Number(subtotal).toLocaleString('en-US')} USD</span>
          <button class="btn remove" onclick="removeItem(${index})">🗑</button>
        </div>
      `;
    });

    // HTML phần tổng cộng và nút thanh toán
    html += `
      <div class="cart-summary fade-in">
        <h4>Total items: ${totalItems}</h4>
        <h4>Total: ${Number(total).toLocaleString('en-US')} USD</h4>
        <div class="nut">
          <a href="/checkout" class="btn">Proceed to Checkout</a>
          <button class="btn danger" onclick="clearCart()">Clear Cart</button>
        </div>
      </div>
    `;

    // Gán HTML vào DOM
    cartContainer.innerHTML = html;
  }

  // Đăng ký các hàm global trên window để onclick HTML có thể gọi
  private setupGlobalFunctions() {
    const win = window as any;

    // Hàm thay đổi số lượng sản phẩm trong giỏ
    // index: vị trí sản phẩm, quantity: số lượng mới
    win.updateQuantity = (index: number, quantity: string) => {
      const qty = parseInt(quantity);  // Chuyển string thành số
      if (isNaN(qty) || qty < 1) return;  // Kiểm tra hợp lệ
      this.cartService.updateQuantity(index, qty);  // Cập nhật trong service
      this.renderCart();  // Render lại giỏ hàng
    };

    // Hàm xóa một sản phẩm khỏi giỏ
    // index: vị trí sản phẩm cần xóa
    win.removeItem = (index: number) => {
      this.cartService.removeItem(index);  // Xóa từ service
      this.renderCart();  // Render lại giỏ hàng
    };

    // Hàm xóa tất cả sản phẩm trong giỏ
    win.clearCart = () => {
      // Hỏi xác nhận trước khi xóa
      if (confirm('Are you sure you want to clear your cart?')) {
        this.cartService.clearCart();  // Xóa toàn bộ
        this.renderCart();  // Render lại giỏ hàng (sẽ trống)
      }
    };
  }
  // Kết thúc CartComponent
}