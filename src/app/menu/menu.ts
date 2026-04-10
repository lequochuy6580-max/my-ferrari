// ========================================
// Menu Component - Menu di động cho mobile
// ========================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
// MenuComponent - Quản lý menu hamburger trên mobile
export class MenuComponent {
  // Trạng thái menu: false = đóng, true = mở
  menuOpen = false;

  // Hàm bật/tắt menu khi click nút hamburger
  // Đảo ngược trạng thái menuOpen từ false -> true hoặc ngược lại
  toggleMenu() {
    this.menuOpen = !this.menuOpen;  // Đảo ngược trạng thái
    const toggleBtn = document.querySelector('.menu-toggle');  // Tìm nút hamburger
    if (toggleBtn) {
      toggleBtn.classList.toggle('active');  // Thêm/bỏ class 'active' để thay đổi icon
    }
  }

  // Hàm đóng menu khi nhấn vào một link
  // Tránh menu vẫn mở sau khi click vào link
  closeMenu() {
    this.menuOpen = false;  // Đặt trạng thái menu thành đóng
    const toggleBtn = document.querySelector('.menu-toggle');  // Tìm nút hamburger
    if (toggleBtn) {
      toggleBtn.classList.remove('active');  // Bỏ class 'active' để icon quay lại bình thường
    }
  }
  // Kết thúc MenuComponent
}
