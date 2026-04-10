import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { ProductItemComponent } from '../product-item/product-item';
import { Footer } from '../footer/footer';

export interface FilterCategory {
  key: string;
  label: string;
  icon: string;
  isSpecial?: boolean;
}

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, ProductItemComponent, Footer],
  standalone: true,
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  allProducts: any[] = [];
  filteredProducts: any[] = [];

  isLoading = true;
  currentFilter = 'all';
  sortOrder: 'default' | 'asc' | 'desc' = 'default';
  searchKeyword = '';

  filterCategories: FilterCategory[] = [];

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(params => {
        this.searchKeyword = params['q'] || '';
        this.currentFilter = params['filter'] || 'all';
        this.loadAll();
      });
    }
  }

  async loadAll() {
    this.isLoading = true;
    try {
      const [products, adminCategories] = await Promise.all([
        this.apiService.getProducts(),
        this.apiService.getCategories(),
      ]);
      this.allProducts = products;
      this.buildFilterCategories(adminCategories);
      this.applyFilters();
    } catch (err) {
      console.error('Error loading shop data:', err);
      this.allProducts = [];
      this.filteredProducts = [];
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private buildFilterCategories(adminCategories: any[]) {
    const ICON_MAP: Record<string, string> = {
      classic: '🏛️', modern: '🚀', 'grand-tourer': '🏎️',
      'grand tourer': '🏎️', hypercar: '⚡', 'super car': '🔥',
      supercar: '🔥', hybrid: '🌿', coupe: '🚗',
      'gt class': '🏆', 'gto class': '🏅', 'gt2 class': '🥈',
      'gt3 class': '🥉', 'le mans hypercar': '🏁',
      'old lemans gt': '🏎️', 'hyper car': '⚡',
    };

    const productCats = new Set<string>(
      this.allProducts
        .map(p => (p.category || '').toLowerCase().trim())
        .filter(c => c)
    );

    const adminCatNames = adminCategories
      .map((c: any) => ((c.ten_loai || c.name) as string || '').toLowerCase().trim())
      .filter((n: string) => n);

    const allCatNames = new Set([...productCats, ...adminCatNames]);

    this.filterCategories = [
      { key: 'all', label: 'Tất Cả', icon: '🚀', isSpecial: true },
    ];

    allCatNames.forEach(catName => {
      const icon = ICON_MAP[catName] || '📂';
      const label = catName
        .split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      this.filterCategories.push({ key: catName, label, icon });
    });

    const hasSale = this.allProducts.some(
      p => p.discount > 0 || (p.sale_price && p.sale_price < p.price)
    );
    if (hasSale) {
      this.filterCategories.push({ key: 'sale', label: 'Khuyến Mãi', icon: '🔥', isSpecial: true });
    }
  }

  setFilter(key: string) {
    this.currentFilter = key;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: key !== 'all' ? key : null },
      queryParamsHandling: 'merge',
    });
    this.applyFilters();
  }

  setSortOrder(order: 'default' | 'asc' | 'desc') {
    this.sortOrder = order;
    this.applyFilters();
  }

  onSearchInput() {
    this.applyFilters();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchKeyword || null },
      queryParamsHandling: 'merge',
    });
  }

  clearSearch() {
    this.searchKeyword = '';
    this.onSearchInput();
  }

  private applyFilters() {
    let result = [...this.allProducts];

    if (this.currentFilter === 'sale') {
      result = result.filter(p =>
        p.discount > 0 || (p.sale_price && p.sale_price < p.price)
      );
    } else if (this.currentFilter !== 'all') {
      result = result.filter(p =>
        (p.category || '').toLowerCase().trim() === this.currentFilter.toLowerCase()
      );
    }

    const keyword = this.searchKeyword.trim().toLowerCase();
    if (keyword) {
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(keyword) ||
        (p.description || '').toLowerCase().includes(keyword)
      );
    }

    if (this.sortOrder === 'asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (this.sortOrder === 'desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    this.filteredProducts = result;
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
    alert('✅ Đã thêm vào giỏ hàng!');
  }

  onViewProduct(productId: number) {
    this.router.navigate(['/viewdetail'], { queryParams: { id: productId } });
  }

  get totalResults(): number {
    return this.filteredProducts.length;
  }
}