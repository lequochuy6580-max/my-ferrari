import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ProductItemComponent } from '../product-item/product-item';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-products-list',
  imports: [CommonModule, ProductItemComponent],
  templateUrl: './products-list.html',
  styleUrl: './products-list.css',
})
export class ProductsListComponent implements OnInit {
  // ===== PRODUCTS & FILTERING =====
  products: any[] = [];
  filteredProducts: any[] = [];
  isFiltering: boolean = false;
  currentFilter: string = 'all';

  // ===== PAGINATION =====
  // Số sản phẩm hiển thị trên mỗi trang
  pageSize: number = 6;
  // Trang hiện tại (bắt đầu từ 1)
  currentPage: number = 1;
  // Danh sách sản phẩm trên trang hiện tại
  paginatedProducts: any[] = [];
  // Tổng số trang
  totalPages: number = 1;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef,              // ← ADD
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
    }
  }

  async loadProducts() {
    try {
      this.products = await this.apiService.getProducts();
      this.filteredProducts = this.products;
      // Reset trang về 1 khi tải sản phẩm mới
      this.currentPage = 1;
      // Cập nhật danh sách sản phẩm cho trang đầu
      this.updatePaginatedProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = [];
      this.filteredProducts = [];
      this.paginatedProducts = [];
    } finally {
      this.cdr.detectChanges();                  // ← ADD: tell Angular state has settled
    }
  }

  async applyFilter(filter: string) {
    await Promise.resolve();
    this.isFiltering = true;
    this.currentFilter = filter;

    try {
      switch (filter) {
        case 'classic':
          this.filteredProducts = await this.apiService.getClassicCars();
          break;
        case 'modern':
          this.filteredProducts = await this.apiService.getModernCars();
          break;
        case 'sale':
          this.filteredProducts = await this.apiService.getSaleProducts();
          break;
        default:
          this.filteredProducts = this.products;
      }
      // Reset trang về 1 khi thay đổi filter
      this.currentPage = 1;
      // Cập nhật danh sách sản phẩm cho trang đầu
      this.updatePaginatedProducts();
    } catch (error) {
      console.error('Error applying filter:', error);
      this.filteredProducts = this.products;
      this.paginatedProducts = [];
    } finally {
      this.isFiltering = false;
      this.cdr.detectChanges();                  // ← ADD: same protection for filters
    }
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
    alert('✅ Sản phẩm đã được thêm vào giỏ hàng!');
  }

  onViewProduct(productId: number) {
    this.viewProduct(productId);
  }

  viewProduct(productId: number) {
    this.router.navigate(['/viewdetail'], {
      queryParams: { id: productId }
    });
  }

  // Helper methods for price display
  isOnSale(product: any): boolean {
    return product.discount > 0 || (product.sale_price && product.sale_price < product.price);
  }

  getSalePrice(product: any): number {
    return this.apiService.calculateSalePrice(product);
  }

  getDiscountPercentage(product: any): number {
    return product.discount || 0;
  }

  getSavings(product: any): number {
    const originalPrice = product.price || 0;
    const salePrice = this.getSalePrice(product);
    return originalPrice - salePrice;
  }

  // ===== PAGINATION METHODS =====
  // Cập nhật danh sách sản phẩm cho trang hiện tại
  // Dùng slice() để lấy phần tử từ vị trí (currentPage-1)*pageSize đến currentPage*pageSize
  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
    // Tính tổng số trang: Math.ceil để làm tròn lên
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  // Chuyển tới trang cụ thể
  // page: số trang (bắt đầu từ 1)
  goToPage(page: number) {
    // Kiểm tra trang hợp lệ
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Cập nhật danh sách sản phẩm
      this.updatePaginatedProducts();
      // Cuộn lên đầu để thấy trang mới
      window.scrollTo(0, 0);
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

  // Lấy mảng số trang để hiển thị trong template
  // Ví dụ: nếu totalPages = 5, trả về [1, 2, 3, 4, 5]
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
