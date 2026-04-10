// ==========================================
// Pagination Component - Quản lý phân trang
// ==========================================
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagepagination.html',
  styleUrl: './pagepagination.css',
})
export class PaginationComponent implements OnChanges {
  // ===== INPUTS =====
  // Danh sách toàn bộ sản phẩm
  @Input() items: any[] = [];
  // Số mục trên mỗi trang (mặc định 6)
  @Input() pageSize: number = 6;
  // Tên CSS class cho container (mặc định là pagination)
  @Input() containerClass: string = 'pagination-container';
  // Tên CSS class cho button Previous/Next
  @Input() buttonClass: string = 'pagination-btn';
  
  // ===== OUTPUTS =====
  // Phát sự kiện khi danh sách sản phẩm trang thay đổi
  // Kèm theo: { items: [], currentPage: 1, totalPages: 5 }
  @Output() pageChanged = new EventEmitter<{
    items: any[];
    currentPage: number;
    totalPages: number;
  }>();

  // ===== PAGINATION PROPERTIES =====
  // Trang hiện tại (bắt đầu từ 1)
  currentPage: number = 1;
  // Tổng số trang
  totalPages: number = 1;
  // Danh sách sản phẩm trên trang hiện tại
  paginatedItems: any[] = [];

  // Khi @Input thay đổi, cập nhật pagination
  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] || changes['pageSize']) {
      // Reset trang về 1 khi items hoặc pageSize thay đổi
      this.currentPage = 1;
      // Cập nhật phân trang
      this.updatePaginatedItems();
    }
  }

  // ===== CORE PAGINATION METHODS =====

  // Cập nhật danh sách sản phẩm cho trang hiện tại
  private updatePaginatedItems() {
    // Tính vị trí bắt đầu: (trang - 1) * kích thước
    const startIndex = (this.currentPage - 1) * this.pageSize;
    // Tính vị trí kết thúc
    const endIndex = startIndex + this.pageSize;
    // Cắt mảng để lấy sản phẩm của trang
    this.paginatedItems = this.items.slice(startIndex, endIndex);
    // Tính tổng số trang: làm tròn lên
    this.totalPages = Math.ceil(this.items.length / this.pageSize);
    
    // Phát sự kiện cho component cha
    this.pageChanged.emit({
      items: this.paginatedItems,
      currentPage: this.currentPage,
      totalPages: this.totalPages
    });
  }

  // Chuyển tới trang cụ thể
  // page: số trang (bắt đầu từ 1)
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedItems();
      // Cuộn lên đầu
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Chuyển tới trang tiếp theo
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Chuyển tới trang trước
  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Lấy mảng số trang để loop trong template
  // Ví dụ: [1, 2, 3, 4, 5]
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Kiểm tra xem có thể chuyển tới trang tiếp theo không
  canNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  // Kiểm tra xem có thể chuyển tới trang trước không
  canPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  // Lấy số thứ tự bắt đầu của sản phẩm trên trang
  // Ví dụ: trang 2, mỗi trang 6 sản phẩm → start = 7
  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  // Lấy số thứ tự kết thúc của sản phẩm trên trang
  // Ví dụ: trang 2, mỗi trang 6 sản phẩm → end = 12
  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.items.length);
  }
}
