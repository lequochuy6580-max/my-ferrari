// ========================================
// Home Component - Trang chủ của ứng dụng
// ========================================
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { BlogService } from '../services/blog.service';
import { I18nService } from '../services/i18n.service';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, Footer],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
// HomeComponent - Hiển thị sản phẩm nổi bật, slideshow, bài viết blog
// Đây là trang chủ mà người dùng thấy khi vào trang web
export class Home implements OnInit {
  // Constructor - Tiêm phụ thuộc các services cần dùng
  constructor(
    private apiService: ApiService,      // Lấy dữ liệu sản phẩm từ API
    private cartService: CartService,    // Quản lý giỏ hàng
    private blogService: BlogService,    // Lấy bài viết blog
    private i18nService: I18nService,    // Quản lý ngôn ngữ
    private router: Router,             // Điều hướng trang
    @Inject(PLATFORM_ID) private platformId: Object  // Kiểm tra browser vs SSR
  ) {}

  // Angular lifecycle: Chạy sau khi component khởi tạo xong
  ngOnInit() {
    // Chỉ chạy trên browser (không chạy trên server SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.setupGlobalFunctions();    // Đăng ký hàm global cho onclick HTML
      this.loadProducts();             // Tải danh sách sản phẩm
      this.loadBlogPosts();            // Tải bài viết blog
      this.initializeSlideshow();      // Khởi tạo slideshow ảnh
      
      // Lắng nghe sự kiện khi admin thay đổi sản phẩm
      this.listenForProductChanges();
    }
  }

  // Lắng nghe sự kiện thay đổi sản phẩm từ admin panel
  private listenForProductChanges() {
    if (isPlatformBrowser(this.platformId)) {
      // Lắng nghe event từ ApiService
      window.addEventListener('productsUpdated', (event: any) => {
        console.log('🔄 Product change detected from ApiService:', event.detail);
        const main = document.getElementById('main-content');
        if (main) {
          this.loadProducts();  // Tải lại sản phẩm
        }
      });

      // Lắng nghe event trực tiếp từ admin panel  
      window.addEventListener('adminProductUpdated', (event: any) => {
        console.log('🔄 Product change detected from Admin Panel:', event.detail);
        const main = document.getElementById('main-content');
        if (main) {
          this.loadProducts();  // Tải lại sản phẩm
        }
      });
    }
  }

  // Đăng ký các hàm global trên window để onclick HTML có thể gọi
  // HTML không thể gọi trực tiếp hàm component, phải qua window
  private setupGlobalFunctions() {
    const win = window as any;

    // Hàm được gọi khi click nút "View Details" trên sản phẩm
    // Điều hướng tới trang chi tiết sản phẩm với product ID
    win.viewProduct = (id: any) => {
      console.log('🔗 viewProduct clicked with ID:', id);
      // Dùng router.navigate để điều hướng (cách Angular)
      this.router.navigate(['/viewdetail'], {
        queryParams: { id: id }  // Truyền product ID qua URL parameter
      }).then(success => {
        console.log('✅ Navigation success:', success);
      }).catch(err => {
        console.error('❌ Navigation error:', err);
        // Nếu Angular routing thất bại, dùng location.href làm backup
        window.location.href = `/viewdetail?id=${id}`;
      });
    };

    // Hàm được gọi khi click nút "Add to Cart"
    // Thêm sản phẩm vào giỏ hàng
    win.addToCart = (productId: any) => {
      // Lấy thông tin sản phẩm từ API trước
      this.apiService.getProductById(productId).then((product: any) => {
        if (product) {
          this.cartService.addToCart(product);  // Thêm vào giỏ hàng
          alert('Product added to cart!');  // Thông báo thành công
        }
      });
    };

    // Hàm được gọi khi click vào bài viết blog
    // Điều hướng tới trang chi tiết bài viết
    win.goToBlogDetail = (articleId: any) => {
      this.router.navigate(['/blog'], { queryParams: { id: articleId } });
    };

    // Hàm được gọi khi di chuột vào card để phát video
    win.playCardVideo = (event: any) => {
      const card = event.currentTarget;
      const video = card.querySelector('video');
      if (video) {
        video.currentTime = 0;
        const playPromise = video.play();
        // Handle browser autoplay policies
        if (playPromise !== undefined) {
          playPromise.catch((error: any) => {
            console.log('Video autoplay was prevented:', error);
          });
        }
      }
    };

    // Hàm được gọi khi rời chuột khỏi card để dừng video
    win.pauseCardVideo = (event: any) => {
      const card = event.currentTarget;
      const video = card.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }

  // ===== PAGINATION FOR HOME PAGE =====
  // Số sản phẩm nổi bật hiển thị trên mỗi trang
  homePageSize: number = 4;
  // Trang hiện tại của trang chủ
  homeCurrentPage: number = 1;
  // Tổng số trang trên trang chủ
  homeTotalPages: number = 1;
  // Danh sách sản phẩm trên trang hiện tại
  homePagedProducts: any[] = [];

  private async loadProducts() {
    // Tăng timeout để đảm bảo DOM đã render xong
    setTimeout(async () => {
      const main = document.getElementById('main-content');
      if (!main) {
        console.error('Không tìm thấy #main-content trong DOM');
        return;
      }

      // Hiển thị loading
      main.innerHTML = `<p style="color:#fff; text-align:center;">Đang tải sản phẩm...</p>`;

      try {
        // Refresh sản phẩm để đảm bảo lấy dữ liệu mới nhất từ admin changes
        const allProducts = await this.apiService.refreshProducts();

        if (!allProducts || allProducts.length === 0) {
          main.innerHTML = `<h3 style="color:#f00; text-align:center;">Không có sản phẩm nào.</h3>`;
          return;
        }

        // Cập nhật pagination
        this.updateHomePagedProducts(allProducts);
        
        // Hàm render danh sách sản phẩm
        const renderProducts = (products: any[]) => {
          return products.map((p: any) => {
            const fallbackImages = [
              'media/sf90.1.jpg', 'media/sf90.2.jpg', 'media/sf90.3.jpg', 'media/sf90.4.jpg',
              'media/1987-Ferrari-F40-004.jpg', 'media/2003-Ferrari-Enzo1383682_.webp',
              'media/2020-Ferrari-F8-Tributo-007-1600.jpg', 'media/dean_smith-enzo_laf-130.jpg',
              'media/ferrari-488-gtb-car-red-cars-wallpaper-preview.jpg',
              'media/red-car-car-luxury-vehicle-red-wallpaper-preview.jpg',
              'media/red-lights-ferrari-ferrari-the-bridge-hd-wallpaper-preview.jpg',
              'media/pexels-alessandro-carrarini-31300621-12576612.jpg',
            ];
            
            const fallbackIndex = p.id % fallbackImages.length;
            const fallbackImage = fallbackImages[fallbackIndex];
            
            const imageUrl =
              p.images?.[0] || p.Images?.[0] || p.image || p.Images || p.thumbnail || fallbackImage;
            const videoUrl = p.video || '';

            return `
              <div class="card fade-in" 
                   onmouseover="playCardVideo(event)" 
                   onmouseout="pauseCardVideo(event)">
                <div class="media-container">
                  <img src="${imageUrl}" alt="${p.name}" width="300" height="300" onerror="this.src='${fallbackImage}'">
                  ${videoUrl ? `<video src="${videoUrl}" muted loop playsinline></video>` : ''}
                </div>
                <h4>${p.name}</h4>
                <p>${Number(p.price).toLocaleString('en-US')} USD</p>
                <button class="btn" onclick="viewProduct(${p.id})">xem chi tiết</button>
                <button class="btn" onclick="addToCart(${p.id})">Thêm vào giỏ</button>
              </div>
            `;
          }).join('');
        };

        // Hàm tạo pagination HTML
        // Dùng inline styles vì innerHTML không bị ảnh hưởng bởi Angular ViewEncapsulation
        const btnBase = `display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#cc0000;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:background 0.2s`;
        const btnDisabled = `display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#333;color:#666;border:none;border-radius:6px;font-size:13px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;cursor:not-allowed;font-family:inherit`;
        const numBase = `width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:1.5px solid #cc0000;border-radius:6px;color:#cc0000;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit`;
        const numActive = `width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;background:#cc0000;border:1.5px solid #cc0000;border-radius:6px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit`;
        const containerStyle = `display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px;margin:32px auto;padding:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(204,0,0,0.2);border-radius:10px`;
        const numbersStyle = `display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center`;

        const getPaginationHTML = () => {
          if (this.homeTotalPages <= 1) return '';
          
          const isPrevDisabled = this.homeCurrentPage === 1;
          const isNextDisabled = this.homeCurrentPage === this.homeTotalPages;

          let html = `
            <div style="${containerStyle}">
              <button style="${isPrevDisabled ? btnDisabled : btnBase}" ${isPrevDisabled ? 'disabled' : ''} onclick="window.homePagePrevious()">
                &#8592; Trước
              </button>
              <div style="${numbersStyle}">
          `;
          
          for (let i = 1; i <= this.homeTotalPages; i++) {
            html += `<button style="${i === this.homeCurrentPage ? numActive : numBase}" onclick="window.homePageGoto(${i})">${i}</button>`;
          }
          
          html += `
              </div>
              <button style="${isNextDisabled ? btnDisabled : btnBase}" ${isNextDisabled ? 'disabled' : ''} onclick="window.homePageNext()">
                Sau &#8594;
              </button>
            </div>
          `;
          
          return html;
        };

        // Render HTML
        main.innerHTML = `
          <h2 class="fade-in" style="color:#f00; text-align:center;">Our Ferrari Collection</h2>
          <div class="product-list">
            ${renderProducts(this.homePagedProducts)}
          </div>
          <div class="home-product-info" style="text-align: center; color: #f00; margin: 20px 0;">
            Tìm thấy <strong>${allProducts.length}</strong> sản phẩm (Trang ${this.homeCurrentPage}/${this.homeTotalPages})
          </div>
          ${getPaginationHTML()}
        `;

        // Đặt các hàm global cho pagination
        const win = window as any;
        
        // Lưu reference tới component và allProducts
        win.homeComponent = this;
        win.homeAllProducts = allProducts;
        
        // Hàm chuyển trang
        win.homePageGoto = (page: number) => {
          this.goToHomePage(page, allProducts);
          // Render lại HTML
          this.loadProducts();
        };
        
        win.homePageNext = () => {
          this.nextHomePage(allProducts);
          this.loadProducts();
        };
        
        win.homePagePrevious = () => {
          this.previousHomePage(allProducts);
          this.loadProducts();
        };

      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        main.innerHTML = `<h3 style="color:#f00; text-align:center;">❌ Failed to load products.</h3>`;
      }
    }, 200);
  }

  private async loadBlogPosts() {
    setTimeout(async () => {
      const blogContainer = document.getElementById('home-blog-container');
      if (!blogContainer) return;

      try {
        const articles = await this.blogService.getLatestArticles(3);

        if (articles.length === 0) {
          blogContainer.innerHTML = '<div class="no-articles">Chưa có bài viết nào</div>';
          return;
        }

        blogContainer.innerHTML = articles
          .map(
            (article: any) => `
          <div class="home-blog-card" onclick="goToBlogDetail(${article.id})">
            <img
              src="${article.image}"
              alt="${article.title}"
              class="home-blog-image"
              width="300"
              height="200"
              onerror="this.src='media/sf90.1.jpg'"
            >
            <div class="home-blog-content">
              <span class="home-blog-category">${article.category}</span>
              <h3 class="home-blog-title">${article.title}</h3>
              <p class="home-blog-excerpt">${article.excerpt}</p>
              <div class="home-blog-footer">
                <span class="home-blog-date">📅 ${this.blogService.formatDate(article.date)}</span>
                <button class="read-btn">Đọc →</button>
              </div>
            </div>
          </div>
        `
          )
          .join('');
      } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
        blogContainer.innerHTML = '<div class="no-articles">Lỗi khi tải bài viết</div>';
      }
    }, 200);
  }

  private initializeSlideshow() {
    setTimeout(() => {
      const slides = document.querySelectorAll('.slideshow-image');
      const thumbnails = document.querySelectorAll('.thumbnail');
      let slideIndex = 0;
      let autoTimer: any;

      if (slides.length === 0) return;

      const showSlides = (index: number) => {
        slides.forEach((slide) => slide.classList.remove('active'));
        thumbnails.forEach((thumb) => thumb.classList.remove('active'));

        if (slides[index]) slides[index].classList.add('active');
        if (thumbnails[index]) thumbnails[index].classList.add('active');
      };

      const changeSlide = (direction: number) => {
        slideIndex += direction;
        if (slideIndex < 0) slideIndex = slides.length - 1;
        else if (slideIndex >= slides.length) slideIndex = 0;
        showSlides(slideIndex);
      };

      // Hiển thị slide đầu tiên ngay lập tức
      showSlides(slideIndex);

      const win = window as any;
      win.changeSlide = changeSlide;
      win.jumpToSlide = (index: number) => {
        slideIndex = index;
        showSlides(slideIndex);
        // Reset auto timer khi user tự chuyển slide
        clearInterval(autoTimer);
        autoTimer = setInterval(() => changeSlide(1), 5000);
      };

      // Auto-advance slideshow every 5 seconds
      autoTimer = setInterval(() => changeSlide(1), 5000);
    }, 200);
  }

  // ===== HOME PAGE PAGINATION METHODS =====
  // Cập nhật danh sách sản phẩm cho trang hiện tại của trang chủ
  updateHomePagedProducts(allProducts: any[]) {
    const startIndex = (this.homeCurrentPage - 1) * this.homePageSize;
    const endIndex = startIndex + this.homePageSize;
    this.homePagedProducts = allProducts.slice(startIndex, endIndex);
    // Tính tổng số trang
    this.homeTotalPages = Math.ceil(allProducts.length / this.homePageSize);
  }

  // Chuyển tới trang cụ thể của trang chủ
  goToHomePage(page: number, allProducts: any[]) {
    if (page >= 1 && page <= this.homeTotalPages) {
      this.homeCurrentPage = page;
      this.updateHomePagedProducts(allProducts);
      // Cuộn tới vị trí danh sách sản phẩm
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Chuyển tới trang tiếp theo
  nextHomePage(allProducts: any[]) {
    if (this.homeCurrentPage < this.homeTotalPages) {
      this.goToHomePage(this.homeCurrentPage + 1, allProducts);
    }
  }

  // Chuyển tới trang trước
  previousHomePage(allProducts: any[]) {
    if (this.homeCurrentPage > 1) {
      this.goToHomePage(this.homeCurrentPage - 1, allProducts);
    }
  }

  // Lấy mảng số trang
  getHomePageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.homeTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}