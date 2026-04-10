import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';

export interface Product {
  id?: number | string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
  discount?: number;
  video?: string;
}

export interface Category {
  ten_loai?: string;
  name?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Order {
  id?: string | number;
  orderId?: string;
  customerName?: string;   // tên field từ checkout.ts
  customer?: string;       // tên field cũ
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  paymentMethod?: string;
  total?: number;
  totalAmount?: number;    // tên field từ checkout.ts
  status?: string;
  date?: string;
  orderDate?: string;      // tên field từ checkout.ts
  items?: any[];
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  currentTab: string = 'dashboard';

  products: Product[] = [];
  filteredProducts: Product[] = [];
  editingProductIndex: number | null = null;
  productForm: FormGroup;
  imgPreviewUrl: string | null = null;

  categories: Category[] = [];
  newCategoryName: string = '';

  customers: Customer[] = [];
  orders: Order[] = [];

  totalProducts: number = 0;
  totalRevenue: number = 0;
  totalCustomers: number = 0;
  totalOrders: number = 0;

  isLoading: boolean = false;
  searchKeyword: string = '';

  // Trạng thái đơn hàng có thể chọn
  readonly orderStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.productForm = this.fb.group({
      name: [''], price: [0], category: [''],
      image: [''], description: [''], video: ['']
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllData();
      this.restorePreviousTab();
    }
  }

  switchTab(tabName: string) {
    this.currentTab = tabName;
    localStorage.setItem('adminTab', tabName);
    if (tabName === 'dashboard')   this.updateDashboard();
    else if (tabName === 'products')   this.loadProducts();
    else if (tabName === 'categories') this.loadCategories();
    else if (tabName === 'customers')  this.loadCustomers();
    else if (tabName === 'orders')     this.loadOrders();
  }

  private restorePreviousTab() {
    const savedTab = localStorage.getItem('adminTab');
    if (savedTab) this.switchTab(savedTab);
  }

  private async loadAllData() {
    try {
      this.isLoading = true;
      this.products = await this.apiService.getProducts();

      const response = await fetch('/db.json');
      const data = await response.json();
      this.categories = data.loai || [];

      this.loadCustomers();
      this.loadOrders();
      this.updateDashboard();
    } catch (error) {
      console.error('❌ Lỗi tải dữ liệu:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadProducts() {
    try {
      this.products = await this.apiService.getProducts();
      this.filteredProducts = [...this.products];
    } catch { this.products = []; }
  }

  async loadCategories() {
    try {
      const saved = localStorage.getItem('ferrariData');
      if (saved) this.categories = JSON.parse(saved).loai || [];
    } catch {}
  }

  // ── Đọc mảng users[] được register.ts lưu ──
  loadCustomers() {
    try {
      const users: any[] = JSON.parse(localStorage.getItem('users') || '[]');
      this.customers = users.map(u => ({
        id:        u.id || u.email,
        name:      u.name || u.username || '',
        email:     u.email || '',
        phone:     u.phone || 'N/A',
        address:   u.address || 'N/A',
        createdAt: u.createdAt || '',
      }));
      this.totalCustomers = this.customers.length;
      this.updateDashboard();
    } catch (e) {
      console.error('❌ Lỗi tải khách hàng:', e);
    }
  }

  // ── Đọc orders[] được checkout.ts lưu, chuẩn hoá field ──
  loadOrders() {
    try {
      const raw: any[] = JSON.parse(localStorage.getItem('orders') || '[]');
      this.orders = raw.map(o => ({
        ...o,
        // Chuẩn hoá tên hiển thị
        customer:  o.customerName || o.customer || 'N/A',
        total:     o.totalAmount  || o.total    || 0,
        date:      o.orderDate
                     ? new Date(o.orderDate).toLocaleDateString('vi-VN')
                     : (o.date || 'N/A'),
        status:    o.status || 'pending',
      }));
      this.totalOrders = this.orders.length;
      this.totalRevenue = this.orders.reduce((s, o) => s + (o.total || 0), 0);
      this.updateDashboard();
    } catch (e) {
      console.error('❌ Lỗi tải đơn hàng:', e);
    }
  }

  // ── Cập nhật trạng thái đơn hàng và lưu lại localStorage ──
  updateOrderStatus(index: number, newStatus: string) {
    this.orders[index].status = newStatus;

    // Lưu lại vào localStorage (cập nhật field gốc)
    const raw: any[] = JSON.parse(localStorage.getItem('orders') || '[]');
    if (raw[index]) {
      raw[index].status = newStatus;
      localStorage.setItem('orders', JSON.stringify(raw));
    }
  }

  updateDashboard() {
    this.totalProducts  = this.products.length;
    this.totalRevenue   = this.orders.reduce((s, o) => s + (o.total || 0), 0);
    this.totalCustomers = this.customers.length;
    this.totalOrders    = this.orders.length;
  }

  // ── Thống kê theo trạng thái ──
  countByStatus(status: string): number {
    return this.orders.filter(o => o.status === status).length;
  }

  // ── Dữ liệu biểu đồ theo tháng ──
  get monthlyStats(): { month: string; revenue: number; orders: number }[] {
    const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    const data: Record<string, { revenue: number; orders: number }> = {};
    months.forEach(m => (data[m] = { revenue: 0, orders: 0 }));

    this.orders.forEach(o => {
      let date: Date | null = null;
      if (o.orderDate) date = new Date(o.orderDate);
      else if (o.date)  date = new Date(o.date);
      if (date && !isNaN(date.getTime())) {
        const key = `T${date.getMonth() + 1}`;
        data[key].revenue += o.total || 0;
        data[key].orders  += 1;
      }
    });

    return months.map(m => ({ month: m, ...data[m] }));
  }

  get maxMonthlyRevenue(): number {
    return Math.max(1, ...this.monthlyStats.map(m => m.revenue));
  }

  get maxMonthlyOrders(): number {
    return Math.max(1, ...this.monthlyStats.map(m => m.orders));
  }

  getBarHeight(revenue: number): number {
    return Math.round((revenue / this.maxMonthlyRevenue) * 100);
  }

  formatRevenue(val: number): string {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000)     return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  }

  saveProduct() {
    const formValue = this.productForm.value;
    const newProduct: Product = {
      name: formValue.name, price: Number(formValue.price),
      category: formValue.category,
      image: this.imgPreviewUrl || formValue.image,
      description: formValue.description, video: formValue.video || undefined
    };

    if (this.editingProductIndex !== null) {
      const productId = this.products[this.editingProductIndex].id;
      this.apiService.updateProduct(productId, newProduct).then(() => {
        this.products[this.editingProductIndex!] = { ...newProduct, id: productId };
        this.editingProductIndex = null;
        this.loadProducts();
        window.dispatchEvent(new CustomEvent('adminProductUpdated', { detail: { action: 'update' } }));
        alert('✅ Cập nhật thành công!');
      });
    } else {
      this.apiService.addProduct(newProduct).then(() => {
        this.loadProducts();
        window.dispatchEvent(new CustomEvent('adminProductUpdated', { detail: { action: 'add' } }));
        alert('✅ Thêm sản phẩm thành công!');
      });
    }
    this.productForm.reset();
    this.imgPreviewUrl = null;
  }

  editProduct(index: number) {
    const product = this.products[index];
    this.productForm.patchValue(product);
    this.imgPreviewUrl = product.image || null;
    this.editingProductIndex = index;
  }

  deleteProduct(index: number) {
    if (confirm('❓ Xóa sản phẩm này?')) {
      const productId = this.products[index].id;
      this.apiService.deleteProduct(productId).then(() => {
        this.products.splice(index, 1);
        this.filteredProducts = [...this.products];
        alert('✅ Đã xóa!');
      });
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imgPreviewUrl = e.target.result;
        this.productForm.patchValue({ image: this.imgPreviewUrl });
      };
      reader.readAsDataURL(file);
    }
  }

  searchProducts() {
    if (!this.searchKeyword.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p =>
        p.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        p.description?.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }
  }

  addCategory() {
    if (!this.newCategoryName.trim()) { alert('Nhập tên danh mục!'); return; }
    if (this.categories.some(c => (c.ten_loai || c.name) === this.newCategoryName)) {
      alert('Danh mục đã tồn tại!'); return;
    }
    this.categories.push({ ten_loai: this.newCategoryName });
    this.newCategoryName = '';
    this.saveToLocalStorage();
  }

  deleteCategory(index: number) {
    if (confirm('❓ Xóa danh mục này?')) {
      this.categories.splice(index, 1);
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage() {
    // Lưu vào ferrariData (legacy)
    localStorage.setItem('ferrariData', JSON.stringify({
      products: this.products, loai: this.categories, orders: this.orders
    }));
    // Lưu vào ferrariCategories (key ApiService + Shop đọc)
    localStorage.setItem('ferrariCategories', JSON.stringify(this.categories));
  }

  exportData() {
    const json = JSON.stringify({ products: this.products, categories: this.categories, customers: this.customers, orders: this.orders }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'ferrari-admin-export.json'; link.click();
    URL.revokeObjectURL(url);
  }

  clearAllData() {
    if (confirm('⚠️ Xóa TẤT CẢ dữ liệu? Không thể hoàn tác!')) {
      localStorage.removeItem('ferrariData');
      localStorage.removeItem('orders');
      localStorage.removeItem('users');
      this.products = []; this.categories = []; this.orders = []; this.customers = [];
      this.updateDashboard();
      alert('✅ Đã xóa tất cả');
    }
  }
}