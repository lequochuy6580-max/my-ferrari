// ========================================
// API Service - Quản lý dữ liệu & cache
// ========================================
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'  // Dùng một instance duy nhất cho toàn ứng dụng
})
// ApiService - Xử lý toàn bộ giao tiếp với API
// Quản lý caching sản phẩm, bài viết, lọc sản phẩm theo category/giá
export class ApiService {
  // URL tới file db.json chứa dữ liệu sản phẩm
  private API_URL = '/db.json';
  
  // Cache sản phẩm (để tránh fetch nhiều lần)
  private productsCache: any[] | null = null;
  
  // Cache bài viết blog
  private articlesCache: any[] | null = null;
  
  // Thời gian cache hợp lệ: 5 phút = 5 × 60 × 1000 millisecond
  private cacheExpiry: number = 5 * 60 * 1000;
  
  // Thời điểm fetch dữ liệu cuối cùng
  private lastFetchTime: number = 0;

  // Constructor - Kiểm tra môi trường & tải cache
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Chỉ chạy trên browser (không chạy trên server SSR)
    if (isPlatformBrowser(this.platformId)) {
      // Cố gắng tải dữ liệu từ localStorage nếu có
      this.loadFromLocalStorage();
      // Tải sản phẩm sẵn sàng ngay khi app khởi động
      this.preloadProducts().catch(err => console.error('Preload error:', err));
    }
  }

  // Hàm tải dữ liệu từ localStorage nếu còn hợp lệ
  private loadFromLocalStorage(): void {
    // Kiếm tra có phải browser không
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      // Lấy dữ liệu sản phẩm từ localStorage
      const cached = localStorage.getItem('ferrariProducts');
      // Lấy timestamp khi lưu
      const timestamp = localStorage.getItem('ferrariProductsTime');
      
      // Kiếm tra cả hai tồn tại
      if (cached && timestamp) {
        // Tính tuổi của cache (hiện tại - lúc lưu)
        const age = Date.now() - parseInt(timestamp, 10);
        // Nếu cache chưa quá 5 phút
        if (age < this.cacheExpiry) {
          this.productsCache = JSON.parse(cached);  // Phục hồi dữ liệu
          this.lastFetchTime = parseInt(timestamp, 10);  //Phục hồi timestamp
          console.log('✅ Loaded products from localStorage');
        }
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }

  // Hàm lưu dữ liệu vào localStorage
  private saveToLocalStorage(): void {
    // Kiếm tra browser & có dữ liệu không
    if (!isPlatformBrowser(this.platformId) || !this.productsCache) return;
    
    try {
      // Lưu mảng sản phẩm dưới dạng JSON string
      localStorage.setItem('ferrariProducts', JSON.stringify(this.productsCache));
      // Lưu timestamp lúc lưu (dùng để kiếm tra tuổi cache)
      localStorage.setItem('ferrariProductsTime', this.lastFetchTime.toString());
      console.log('✅ Saved products to localStorage');
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }

  // Hàm tải sản phẩm sẵn sàng (chạy background khi app khởi động)
  async preloadProducts(): Promise<void> {
    try {
      // Nếu cache chưa hợp lệ, fetch dữ liệu
      if (!this.isCacheValid()) {
        console.log('Preloading products...');
        await this.getProducts();  // Fetch và cache
      }
    } catch (err) {
      console.error('Preload failed:', err);
    }
  }

  // Hàm tạo URL tuyệt đối (cho SSR)
  private getAbsoluteUrl(path: string): string {
    // Trên browser, URL tương đối hoạt động bình thường
    if (isPlatformBrowser(this.platformId)) {
      return path;
    }
    // Trên server (SSR), cần URL tuyệt đối
    const baseUrl = 'http://localhost:4200';
    return baseUrl + path;
  }

  // Hàm kiếm tra cache còn hợp lệ không
  // Trả về true nếu: có dữ liệu AND chưa quá hạn
  private isCacheValid(): boolean {
    const now = Date.now();
    return this.productsCache !== null && (now - this.lastFetchTime) < this.cacheExpiry;
  }

  // Hàm lấy tất cả sản phẩm (cached + localStorage)
  async getProducts(): Promise<any[]> {
    try {
      // 1️⃣ KIỂM TRA localStorage ĐẦU TIÊN (Admin có thể đã thay đổi dữ liệu)
      if (isPlatformBrowser(this.platformId)) {
        const localStorageData = localStorage.getItem('ferrariProducts');
        if (localStorageData) {
          try {
            this.productsCache = JSON.parse(localStorageData);
            this.lastFetchTime = Date.now();
            if (this.productsCache) {
              console.log('✅ Loaded products from localStorage:', this.productsCache.length, 'products');
            }
            return this.productsCache || [];
          } catch (err) {
            console.error('Error parsing localStorage data:', err);
          }
        }
      }

      // 2️⃣ KIỂM TRA in-memory cache (nếu localStorage trống)
      if (this.isCacheValid() && this.productsCache) {
        console.log('Returning cached products');
        return this.productsCache;
      }

      // 3️⃣ FETCH TỪ SERVER NẾU CACHE HẾT HẠN
      console.log('Fetching products from server');
      const url = this.getAbsoluteUrl(this.API_URL);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Cannot fetch product data');
      const data = await res.json();
      
      // Lưu vào cache
      this.productsCache = data.products || [];
      this.lastFetchTime = Date.now();
      
      // Lưu xuống localStorage
      this.saveToLocalStorage();
      
      return this.productsCache || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return this.productsCache || [];
    }
  }

  // Hàm lấy một sản phẩm theo ID
  async getProductById(id: any): Promise<any> {
    try {
      // Kiếm tra ID có hợp lệ không
      if (!id) {
        console.error('Product ID is empty or null');
        return null;
      }

      // Chuyển ID thành số
      const numId = parseInt(id, 10);

      // Kiếm tra có phải số không
      if (isNaN(numId)) {
        console.error('Invalid product ID:', id);
        return null;
      }

      // Trước tiên, tìm trong cache
      if (this.productsCache) {
        const cachedProduct = this.productsCache.find((p: any) => p.id === numId);
        if (cachedProduct) {
          console.log('Found product in cache:', cachedProduct);
          return cachedProduct;  // Tìm thấy, return ngay
        }
      }

      // Nếu không thấy trong cache, fetch tất cả sản phẩm
      const products = await this.getProducts();
      const product = products.find((p: any) => p.id === numId);
      
      // Nếu không thấy, log error và debug info
      if (!product) {
        console.error('Product not found with ID:', numId, 'Available IDs:', products.map((p: any) => p.id));
      }

      return product || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Hàm lấy tất cả bài viết blog
  async getArticles(): Promise<any[]> {
    try {
      const url = this.getAbsoluteUrl(this.API_URL);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Cannot fetch articles');
      const data = await res.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  // Hàm lấy một bài viết theo ID
  async getArticleById(id: any): Promise<any> {
    try {
      const articles = await this.getArticles();
      return articles.find((a: any) => a.id === parseInt(id));
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  // ============ CÁC HÀM LỌC THEO CATEGORY ============
  
  // Hàm lấy xe CỔ ĐIỂN (Classic cars)
  async getClassicCars(): Promise<any[]> {
    try {
      const products = await this.getProducts();
      // Lọc các sản phẩm có category = 'classic'
      return (products || []).filter((product: any) => product.category === 'classic');
    } catch (error) {
      console.error('Error fetching classic cars:', error);
      return [];
    }
  }

  // Hàm lấy xe HIỆN ĐẠI (Modern cars)
  // Bao gồm: category = 'modern' OR không có category
  async getModernCars(): Promise<any[]> {
    try {
      const products = await this.getProducts();
      // Lọc các sản phẩm có category = 'modern' hoặc không xác định
      return (products || []).filter((product: any) => product.category === 'modern' || !product.category);
    } catch (error) {
      console.error('Error fetching modern cars:', error);
      return [];
    }
  }

  // Hàm lấy sản phẩm ĐANG GIẢM GIÁ (Sale productss)
  // Điều kiện: có discount > 0 HOẶC sale_price < price
  async getSaleProducts(): Promise<any[]> {
    try {
      const products = await this.getProducts();
      return (products || []).filter((product: any) => {
        // Kiếm tra: có discount hoặc sale_price nhỏ hơn giá gốc
        return product.discount > 0 || (product.sale_price && product.sale_price < product.price);
      });
    } catch (error) {
      console.error('Error fetching sale products:', error);
      return [];
    }
  }

  // Hàm lấy sản phẩm theo category (generic)
  async getProductsByCategory(category: string): Promise<any[]> {
    try {
      const products = await this.getProducts();
      // Nếu category = 'all' hoặc trống, trả về tất cả
      if (!category || category === 'all') {
        return products;
      }
      // Ngược lại, lọc theo category
      return (products || []).filter((product: any) => product.category === category);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // ============ CATEGORY MANAGEMENT ============

  // Hàm lấy danh sách danh mục
  async getCategories(): Promise<any[]> {
    try {
      // Kiểm tra localStorage trước (Admin có thể đã thay đổi)
      if (isPlatformBrowser(this.platformId)) {
        const localStorageData = localStorage.getItem('ferrariCategories');
        if (localStorageData) {
          try {
            return JSON.parse(localStorageData);
          } catch (err) {
            console.error('Error parsing categories from localStorage:', err);
          }
        }
      }

      // Fetch từ server nếu localStorage trống
      const url = this.getAbsoluteUrl(this.API_URL);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Cannot fetch categories');
      const data = await res.json();
      const categories = data.loai || [];
      
      // Lưu vào localStorage
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('ferrariCategories', JSON.stringify(categories));
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Hàm thêm danh mục mới
  async addCategory(categoryName: string): Promise<any> {
    try {
      const categories = await this.getCategories();
      const newCategory = {
        id: Math.max(0, ...categories.map((c: any) => parseInt(c.id) || 0)) + 1,
        ten_loai: categoryName,
        name: categoryName
      };
      
      const updatedCategories = [...categories, newCategory];
      
      // Lưu vào localStorage
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('ferrariCategories', JSON.stringify(updatedCategories));
      }
      
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // Hàm xóa danh mục
  async deleteCategory(categoryId: any): Promise<void> {
    try {
      const categories = await this.getCategories();
      const updatedCategories = categories.filter((c: any) => c.id !== categoryId);
      
      // Lưu vào localStorage
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('ferrariCategories', JSON.stringify(updatedCategories));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // ============ PRODUCT MANAGEMENT (CRUD) ============
  
  // Hàm thêm sản phẩm mới
  async addProduct(product: any): Promise<any> {
    try {
      if (!this.productsCache) {
        await this.getProducts();  // Load products nếu chưa có
      }
      
      // Tăng ID tự động
      const maxId = Math.max(0, ...(this.productsCache || []).map((p: any) => p.id || 0));
      product.id = maxId + 1;
      
      // Thêm vào cache
      this.productsCache = [...(this.productsCache || []), product];
      
      // Lưu vào localStorage
      this.saveToLocalStorage();
      
      // Phát event để các component khác biết có thay đổi
      this.notifyProductChange('add', product);
      
      console.log('✅ Product added:', product);
      return product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Hàm cập nhật sản phẩm
  async updateProduct(productId: any, productData: any): Promise<any> {
    try {
      if (!this.productsCache) {
        await this.getProducts();
      }
      
      if (!this.productsCache) {
        throw new Error('Failed to load products');
      }
      
      const index = this.productsCache.findIndex((p: any) => p.id === productId);
      if (index === -1) {
        throw new Error('Product not found');
      }
      
      // Cập nhật sản phẩm
      this.productsCache[index] = { ...this.productsCache[index], ...productData, id: productId };
      
      // Lưu vào localStorage
      this.saveToLocalStorage();
      
      // Phát event
      this.notifyProductChange('update', this.productsCache[index]);
      
      console.log('✅ Product updated:', this.productsCache[index]);
      return this.productsCache[index];
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Hàm xóa sản phẩm
  async deleteProduct(productId: any): Promise<void> {
    try {
      if (!this.productsCache) {
        await this.getProducts();
      }
      
      if (!this.productsCache) {
        throw new Error('Failed to load products');
      }
      
      const index = this.productsCache.findIndex((p: any) => p.id === productId);
      if (index === -1) {
        throw new Error('Product not found');
      }
      
      const deletedProduct = this.productsCache[index];
      this.productsCache.splice(index, 1);
      
      // Lưu vào localStorage
      this.saveToLocalStorage();
      
      // Phát event
      this.notifyProductChange('delete', deletedProduct);
      
      console.log('✅ Product deleted:', deletedProduct);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Hàm phát event khi có thay đổi sản phẩm
  private notifyProductChange(action: string, product: any): void {
    if (isPlatformBrowser(this.platformId)) {
      // Tạo event tùy chỉnh
      const event = new CustomEvent('productsUpdated', {
        detail: { action, product, timestamp: Date.now() }
      });
      window.dispatchEvent(event);
      console.log(`📢 Product change event dispatched: ${action}`);
    }
  }

  // Hàm subscribe tới product changes (để components có thể lắng nghe)
  onProductsUpdated(callback: (data: any) => void): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('productsUpdated', (event: any) => {
        callback(event.detail);
      });
    }
  }

  // Hàm tính giá sale của sản phẩm
  // Nếu có sale_price: dùng sale_price
  // Nếu có discount (%): tính price * (1 - discount/100)
  // Ngược lại: trả về price gốc
  calculateSalePrice(product: any): number {
    if (!product) return 0;
    if (product.sale_price && product.sale_price < product.price) {
      return product.sale_price;
    }
    if (product.discount > 0) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price || 0;
  }

  // Hàm refresh products cache (bỏ cache cũ, load lại từ localStorage hoặc server)
  async refreshProducts(): Promise<any[]> {
    try {
      // Bỏ cache
      this.productsCache = null;
      this.lastFetchTime = 0;
      
      // Reload từ localStorage hoặc server
      return await this.getProducts();
    } catch (error) {
      console.error('Error refreshing products:', error);
      return [];
    }
  }
  // Kết thúc ApiService
}