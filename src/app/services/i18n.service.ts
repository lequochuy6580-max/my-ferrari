import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private currentLanguage = new BehaviorSubject<string>('vi');
  public language$ = this.currentLanguage.asObservable();

  // Tất cả các translation
  private translations = {
    vi: {
      // Header
      'header.home': 'Trang Chủ',
      'header.shop': 'Cửa Hàng',
      'header.blog': 'Blog',
      'header.contact': 'Liên Hệ',
      'header.login': 'Đăng Nhập',
      'header.register': 'Đăng Ký',
      'header.account': 'Tài Khoản',
      'header.logout': 'Đăng Xuất',
      'header.admin': 'Admin',
      'header.cart': 'Giỏ Hàng',
      'header.search': 'Tìm Kiếm',

      // Home
      'home.featured_products': 'Sản Phẩm Nổi Bật',
      'home.latest_news': 'Tin Tức Mới Nhất',
      'home.explore': 'Khám Phá',
      'home.view_details': 'Xem Chi Tiết',
      'home.add_to_cart': 'Thêm Vào Giỏ',
      'home.price': 'Giá',
      'home.blog_title': '📰 Ferrari Blog',
      'home.blog_subtitle': 'Khám phá những câu chuyện tuyệt vời về thương hiệu Ferrari',
      'home.view_all': 'Xem Tất Cả Bài Viết →',

      // Shop
      'shop.title': 'Cửa Hàng Ferrari',
      'shop.filter': 'Lọc',
      'shop.price': 'Giá',
      'shop.category': 'Danh Mục',
      'shop.brand': 'Hãng',
      'shop.sort': 'Sắp Xếp',
      'shop.results': 'Kết Quả',
      'shop.all': 'Tất Cả',
      'shop.classic': 'Cổ Điển',
      'shop.modern': 'Hiện Đại',
      'shop.grand_tourer': 'Grand Tourismo',
      'shop.sports_car': 'Xe Thể Thao',
      'shop.hypercar': 'Siêu Xe',
      'shop.no_results': 'Không tìm thấy sản phẩm nào',
      'shop.try_other_keywords': 'Thử từ khóa khác hoặc xóa bộ lọc',
      'shop.view_all': 'Xem Tất Cả Sản Phẩm',

      // Product
      'product.price': 'Giá',
      'product.stock': 'Kho',
      'product.add_to_cart': 'Thêm Vào Giỏ Hàng',
      'product.view_details': 'Xem Chi Tiết',
      'product.description': 'Mô Tả',
      'product.specifications': 'Thông Số Kỹ Thuật',

      // Cart
      'cart.title': 'Giỏ Hàng',
      'cart.empty': 'Giỏ hàng của bạn trống',
      'cart.subtotal': 'Tổng Cộng (chưa gồm))',
      'cart.total': 'Tổng Tiền',
      'cart.checkout': 'Thanh Toán',
      'cart.continue_shopping': 'Tiếp Tục Mua Sắm',
      'cart.remove': 'Xóa',
      'cart.quantity': 'Số Lượng',
      'cart.update': 'Cập Nhật',

      // Checkout
      'checkout.title': 'Thanh Toán',
      'checkout.shipping': 'Thông Tin Giao Hàng',
      'checkout.billing': 'Thông Tin Thanh Toán',
      'checkout.payment_method': 'Phương Thức Thanh Toán',
      'checkout.place_order': 'Đặt Hàng',
      'checkout.order_summary': 'Tóm Tắt Đơn Hàng',

      // Auth
      'auth.login': 'Đăng Nhập',
      'auth.register': 'Đăng Ký',
      'auth.email': 'Email',
      'auth.password': 'Mật Khẩu',
      'auth.confirm_password': 'Xác Nhận Mật Khẩu',
      'auth.name': 'Tên Đầy Đủ',
      'auth.phone': 'Số Điện Thoại',
      'auth.address': 'Địa Chỉ',
      'auth.forgot_password': 'Quên Mật Khẩu',
      'auth.remember_me': 'Nhớ Tôi',
      'auth.submit': 'Xác Nhận',
      'auth.no_account': 'Bạn chưa có tài khoản?',
      'auth.have_account': 'Bạn đã có tài khoản?',

      // Admin
      'admin.dashboard': 'Bảng Điều Khiển',
      'admin.products': 'Sản Phẩm',
      'admin.categories': 'Danh Mục',
      'admin.orders': 'Đơn Hàng',
      'admin.customers': 'Khách Hàng',
      'admin.statistics': 'Thống Kê',
      'admin.settings': 'Cài Đặt',
      'admin.add_product': 'Thêm Sản Phẩm',
      'admin.edit': 'Sửa',
      'admin.delete': 'Xóa',
      'admin.save': 'Lưu',
      'admin.cancel': 'Hủy',

      // Common
      'common.loading': 'Đang tải...',
      'common.error': 'Lỗi',
      'common.success': 'Thành Công',
      'common.close': 'Đóng',
      'common.save': 'Lưu',
      'common.delete': 'Xóa',
      'common.edit': 'Sửa',
      'common.add': 'Thêm',
      'common.yes': 'Có',
      'common.no': 'Không',
      'common.back': 'Quay Lại',
      'common.next': 'Tiếp Theo',
      'common.previous': 'Trước Đó',

      // Footer
      'footer.company_name': 'Ferrari Motors',
      'footer.about': 'Sức mạnh của tốc độ và phong cách kết hợp.',
      'footer.quick_links': 'Liên Kết Nhanh',
      'footer.about_us': 'Về Chúng Tôi',
      'footer.support': 'Hỗ Trợ',
      'footer.help_center': 'Trung Tâm Trợ Giúp',
      'footer.return_policy': 'Chính Sách Hoàn Trả',
      'footer.terms_of_use': 'Điều Khoản Sử Dụng',
      'footer.contact': 'Liên Hệ',
      'footer.email': 'Email',
      'footer.hotline': 'Hotline',
      'footer.copyright': '© 2025 Ferrari Motors. Tất Cả Quyền Được Bảo Vệ.',
    },
    en: {
      // Header
      'header.home': 'Home',
      'header.shop': 'Shop',
      'header.blog': 'Blog',
      'header.contact': 'Contact',
      'header.login': 'Login',
      'header.register': 'Register',
      'header.account': 'Account',
      'header.logout': 'Logout',
      'header.admin': 'Admin',
      'header.cart': 'Cart',
      'header.search': 'Search',

      // Home
      'home.featured_products': 'Featured Products',
      'home.latest_news': 'Latest News',
      'home.explore': 'Explore',
      'home.view_details': 'View Details',
      'home.add_to_cart': 'Add to Cart',
      'home.price': 'Price',
      'home.blog_title': '📰 Ferrari Blog',
      'home.blog_subtitle': 'Discover amazing stories about Ferrari brand',
      'home.view_all': 'View All Posts →',

      // Shop
      'shop.title': 'Ferrari Shop',
      'shop.filter': 'Filter',
      'shop.price': 'Price',
      'shop.category': 'Category',
      'shop.brand': 'Brand',
      'shop.sort': 'Sort',
      'shop.results': 'Results',
      'shop.all': 'All',
      'shop.classic': 'Classic',
      'shop.modern': 'Modern',
      'shop.grand_tourer': 'Grand Tourer',
      'shop.sports_car': 'Sports Car',
      'shop.hypercar': 'Hypercar',
      'shop.no_results': 'No products found',
      'shop.try_other_keywords': 'Try other keywords or remove filters',
      'shop.view_all': 'View All Products',

      // Product
      'product.price': 'Price',
      'product.stock': 'Stock',
      'product.add_to_cart': 'Add to Cart',
      'product.view_details': 'View Details',
      'product.description': 'Description',
      'product.specifications': 'Specifications',

      // Cart
      'cart.title': 'Shopping Cart',
      'cart.empty': 'Your cart is empty',
      'cart.subtotal': 'Subtotal',
      'cart.total': 'Total',
      'cart.checkout': 'Checkout',
      'cart.continue_shopping': 'Continue Shopping',
      'cart.remove': 'Remove',
      'cart.quantity': 'Quantity',
      'cart.update': 'Update',

      // Checkout
      'checkout.title': 'Checkout',
      'checkout.shipping': 'Shipping Information',
      'checkout.billing': 'Billing Information',
      'checkout.payment_method': 'Payment Method',
      'checkout.place_order': 'Place Order',
      'checkout.order_summary': 'Order Summary',

      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirm_password': 'Confirm Password',
      'auth.name': 'Full Name',
      'auth.phone': 'Phone Number',
      'auth.address': 'Address',
      'auth.forgot_password': 'Forgot Password?',
      'auth.remember_me': 'Remember Me',
      'auth.submit': 'Submit',
      'auth.no_account': "Don't have an account?",
      'auth.have_account': 'Already have an account?',

      // Admin
      'admin.dashboard': 'Dashboard',
      'admin.products': 'Products',
      'admin.categories': 'Categories',
      'admin.orders': 'Orders',
      'admin.customers': 'Customers',
      'admin.statistics': 'Statistics',
      'admin.settings': 'Settings',
      'admin.add_product': 'Add Product',
      'admin.edit': 'Edit',
      'admin.delete': 'Delete',
      'admin.save': 'Save',
      'admin.cancel': 'Cancel',

      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.close': 'Close',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',

      // Footer
      'footer.company_name': 'Ferrari Motors',
      'footer.about': 'The power of speed and style combined.',
      'footer.quick_links': 'Quick Links',
      'footer.about_us': 'About Us',
      'footer.support': 'Support',
      'footer.help_center': 'Help Center',
      'footer.return_policy': 'Return Policy',
      'footer.terms_of_use': 'Terms of Use',
      'footer.contact': 'Contact',
      'footer.email': 'Email',
      'footer.hotline': 'Hotline',
      'footer.copyright': '© 2025 Ferrari Motors. All Rights Reserved.',
    },
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Chỉ truy cập localStorage trên browser, không chạy trên SSR server
    if (isPlatformBrowser(this.platformId)) {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        this.currentLanguage.next(savedLanguage);
      }
    }
  }

  // Chuyển ngôn ngữ
  setLanguage(language: string) {
    if (language === 'vi' || language === 'en') {
      this.currentLanguage.next(language);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('language', language);
      }
    }
  }

  // Lấy ngôn ngữ hiện tại
  getLanguage(): string {
    return this.currentLanguage.value;
  }

  // Dịch key sang ngôn ngữ hiện tại
  translate(key: string, params?: { [key: string]: any }): string {
    const language = this.currentLanguage.value;
    let text: string =
      (this.translations as any)[language]?.[key] || key;

    // Thay thế parameters nếu có
    if (params) {
      Object.keys(params).forEach((param) => {
        text = text.replace(`{{${param}}}`, params[param]);
      });
    }

    return text;
  }

  // Observable để theo dõi sự thay đổi ngôn ngữ
  onLanguageChange(): Observable<string> {
    return this.language$;
  }
}
