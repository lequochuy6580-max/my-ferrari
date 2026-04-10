import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="news-container">
      <h1>Ferrari Blog</h1>
      <div class="category-filter">
        <button *ngFor="let cat of categories" 
                 class="category-btn" 
                 (click)="filterByCategory(cat)"
                 [class.active]="cat === activeCategory">
          {{ cat }}
        </button>
      </div>
      <div id="articles-container" class="articles-grid"></div>
    </div>
  `,
  styleUrl: './news-list.css'
})
export class NewsListComponent implements OnInit {
  categories: string[] = [];
  activeCategory: string = 'all';

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.loadArticles();
    this.setupGlobalFunctions();
  }

  private async loadArticles() {
    try {
      const articles = await this.blogService.fetchArticles();
      this.categories = ['all', ...this.blogService.getCategories(articles)];
      this.displayArticles(articles);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  }

  async filterByCategory(category: string) {
    this.activeCategory = category;
    const articles = await this.blogService.getArticlesByCategory(category);
    this.displayArticles(articles);
  }

  private displayArticles(articles: any[]) {
    const container = document.getElementById('articles-container');
    if (!container) return;

    if (!articles || articles.length === 0) {
      container.innerHTML = '<div class="no-articles">No articles found</div>';
      return;
    }

    container.innerHTML = articles.map(article => `
      <div class="article-card" onclick="goToBlogDetail(${article.id})">
        <img src="${article.image}" alt="${article.title}" class="article-image" onerror="this.src='media/sf90.1.jpg'">
        <div class="article-content">
          <span class="article-category">${article.category}</span>
          <h2 class="article-title">${article.title}</h2>
          <p class="article-excerpt">${article.excerpt}</p>
          <div class="article-meta">
            <span class="article-author">📝 ${article.author}</span>
            <span class="article-date">📅 ${this.blogService.formatDate(article.date)}</span>
          </div>
          <button class="read-more-btn">Read More →</button>
        </div>
      </div>
    `).join('');
  }

  private setupGlobalFunctions() {
    const win = window as any;

    win.goToBlogDetail = (articleId: number) => {
      window.location.href = `/news-detail?id=${articleId}`;
    };
  }
}
