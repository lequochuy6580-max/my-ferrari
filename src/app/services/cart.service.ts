// ========================================
// Cart Service - Quản lý giỏ hàng
// ========================================
import { Injectable } from '@angular/core';

// Interface định nghĩa cấu trúc một item trong giỏ
interface CartItem {
  id: number;        // ID sản phẩm
  name: string;      // Tên sản phẩm
  price: number;     // Giá sản phẩm
  quantity: number;  // Số lượng
  img: string;       // URL ảnh
}

@Injectable({
  providedIn: 'root'  // Dùng một instance duy nhất cho toàn ứng dụng
})
// CartService - Quản lý giỏ hàng (lưu/tải từ localStorage)
export class CartService {
  // Tên key để lưu giỏ hàng trong localStorage
  private storageKey = 'cart';

  // Hàm lấy giỏ hàng từ localStorage
  // Trả về mảng CartItem hoặc mảng rỗng nếu có lỗi
  getCart(): CartItem[] {
    try {
      // Lấy string JSON từ localStorage, parse thành mảng
      // Nếu không có, dùng '[]' làm mặc định
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      // Nếu parse lỗi, return mảng rỗng
      return [];
    }
  }

  // Hàm thêm sản phẩm vào giỏ
  // Nếu sản phẩm đã có, tăng số lượng
  // Nếu chưa có, thêm mới
  addToCart(product: any): void {
    const cart = this.getCart();  // Lấy giỏ hiện tại
    // Tìm sản phẩm với ID giống trong giỏ
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      // Nếu đã có, tăng số lượng thêm 1
      existingItem.quantity += 1;
    } else {
      // Nếu chưa có, tạo item mới
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,  // Bắt đầu với số lượng 1
        img: product.image || product.Images || 'media/sf90.1.jpg'  // Lấy ảnh (với fallback)
      });
    }

    this.saveCart(cart);  // Lưu giỏ mới xuống localStorage
  }

  // Hàm xóa item khỏi giỏ
  // index: vị trí item cần xóa (0 = item đầu tiên)
  removeItem(index: number): void {
    const cart = this.getCart();  // Lấy giỏ hiện tại
    cart.splice(index, 1);  // Xóa 1 phần tử tại vị trí index
    this.saveCart(cart);  // Lưu giỏ cập nhật
  }

  // Hàm cập nhật số lượng item
  // index: vị trí item, quantity: số lượng mới
  updateQuantity(index: number, quantity: number): void {
    const cart = this.getCart();
    // Chỉ cập nhật nếu quantity > 0
    if (quantity > 0) {
      cart[index].quantity = quantity;  // Gán số lượng mới
      this.saveCart(cart);  // Lưu
    }
  }

  // Hàm xóa toàn bộ giỏ hàng
  clearCart(): void {
    localStorage.removeItem(this.storageKey);  // Xóa localStorage entry
  }

  // Hàm lấy tổng số lượng sản phẩm trong giỏ
  // Ví dụ: [2 chiếc xe, 3 chiếc xe] = 5 tổng
  getTotalItems(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  }

  // Hàm lấy tổng tiền trong giỏ
  // Công thức: tổng = Σ(giá × số lượng)
  getTotalPrice(): number {
    return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Hàm lưu giỏ vào localStorage (private, dùng nội bộ)
  private saveCart(cart: CartItem[]): void {
    // Convert mảng thành JSON string rồi lưu
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }
  // Kết thúc CartService
}
