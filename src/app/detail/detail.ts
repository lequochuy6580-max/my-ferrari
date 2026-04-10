import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  template: `
    <div class="product-detail-container">
      <div id="detail-content"></div>
    </div>
  `,
  styleUrl: './detail.css'
})
export class DetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProductDetail();
    this.setupGlobalFunctions();
  }

  private async loadProductDetail() {
    try {
      const productId = this.route.snapshot.queryParamMap.get('id');
      const product = await this.apiService.getProductById(productId);

      const detailContent = document.getElementById('detail-content');
      if (!detailContent) return;

      if (!product) {
        detailContent.innerHTML = '<h3>Product not found</h3>';
        return;
      }

      detailContent.innerHTML = `
        <div class="product-detail fade-in">
          <div class="product-image">
            <img src="${product.Images || product.image || 'media/sf90.1.jpg'}" alt="${product.name}">
            <video src="${product.video}" controls muted loop style="width: 100%; margin-top: 20px;"></video>
          </div>
          <div class="product-info">
            <h1>${product.name}</h1>
            <p class="price">${Number(product.price).toLocaleString("en-US")} USD</p>
            <p class="category">Category: ${product.category || 'Not specified'}</p>
            <p class="description">${product.description || 'No description available'}</p>
            <div class="product-actions">
              <button class="btn" onclick="addToCart(${product.id})">🛒 Add to Cart</button>
              <button class="btn" onclick="window.history.back()">← Back</button>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading product:', error);
    }
  }

  private setupGlobalFunctions() {
    const win = window as any;

    win.addToCart = (productId: number) => {
      this.apiService.getProductById(productId).then((product: any) => {
        if (product) {
          this.cartService.addToCart(product);
          alert('Product added to cart!');
        }
      });
    };
  }
}
