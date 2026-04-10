import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
})
export class Header implements OnInit {
  currentLanguage = 'vi';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private i18nService: I18nService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentLanguage = this.i18nService.getLanguage();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeHeader();
      this.setupGlobalFunctions();
    }
  }

  private initializeHeader() {
    setTimeout(() => {
      this.updateUserInfo();
    }, 100);
  }

  private updateUserInfo() {
    const userInfoEl = document.getElementById("userInfo");
    if (!userInfoEl) return;
    
    const user = this.authService.getCurrentUser();
    if (user) {
      userInfoEl.innerHTML = `
        <span>👤 ${user.name}</span>
        <a href="javascript:void(0)" onclick="logout()">Đăng xuất</a>
      `;
    } else {
      userInfoEl.innerHTML = `<a href="/login">Đăng nhập</a>`;
    }
  }

  changeLanguage(lang: string) {
    this.i18nService.setLanguage(lang);
    this.currentLanguage = lang;
    // Reload page để cập nhật tất cả translations
    window.location.reload();
  }

  private setupGlobalFunctions() {
    const win = window as any;
    
    // Language switcher (keep global for any legacy onclick usage)
    win.changeLanguage = (lang: string) => this.changeLanguage(lang);

    win.logout = () => {
      this.authService.logout();
      window.location.href = "/";
    };

    win.searchProduct = async () => {
      const input = document.getElementById("searchInput") as HTMLInputElement | null;
      const keyword = input ? input.value.trim().toLowerCase() : "";
      if (!keyword) {
        alert("Please enter a product name to search.");
        return;
      }

      try {
        const products = await this.apiService.getProducts();
        const results = products.filter((p: any) => p.name.toLowerCase().includes(keyword));
        const main = document.getElementById("main-content") || document.querySelector("main");
        if (!main) return;
        
        if (results.length === 0) {
          main.innerHTML = `<h3 style="color:red;text-align:center;">No products found.</h3>`;
        } else {
          main.innerHTML = `
            <h2 style="text-align:center;color:#f00;">Search Results for "${keyword}"</h2>
            <div class="product-list">
              ${results.map((p: any) => `
                <div class="card fade-in">
                  <div class="media-container">
                    <img src="${p.image || p.Images || 'media/sf90.1.jpg'}" alt="${p.name}">
                  </div>
                  <h4>${p.name}</h4>
                  <p>${Number(p.price).toLocaleString("en-US")} USD</p>
                  <button class="btn" onclick="viewProduct(${p.id})">View Details</button>
                </div>
              `).join("")}
            </div>
          `;
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    };
  }
}