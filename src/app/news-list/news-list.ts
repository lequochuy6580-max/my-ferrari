import { Component, Inject, PLATFORM_ID, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Footer],
  templateUrl: './news-list.html',
  styleUrl: './news-list.css'
})
export class NewsList {
  categories: string[] = [];
  activeCategory: string = 'all';
  articles: any[] = [];
  filteredArticles: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // afterNextRender: chạy 1 lần sau khi browser hydrate xong
    // Giải quyết vấn đề SSR render isLoading=true rồi browser không re-trigger
    afterNextRender(() => {
      this.loadArticles();
    });
  }

  private async loadArticles() {
    try {
      this.isLoading = true;
      this.error = null;
      this.cdr.detectChanges();

      const articles = await this.blogService.fetchArticles();

      if (!articles || articles.length === 0) {
        this.error = 'No articles found.';
        return;
      }

      this.articles = articles;
      this.filteredArticles = [...articles];
      this.categories = ['all', ...this.blogService.getCategories(articles)];
    } catch (err) {
      console.error('Error loading articles:', err);
      this.error = 'Failed to load articles. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async filterByCategory(category: string) {
    this.activeCategory = category;
    try {
      if (category === 'all') {
        this.filteredArticles = [...this.articles];
      } else {
        this.filteredArticles = await this.blogService.getArticlesByCategory(category);
      }
    } catch (err) {
      console.error('Error filtering articles:', err);
      this.filteredArticles = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  goToBlogDetail(articleId: number) {
    this.router.navigate(['/blog'], { queryParams: { id: articleId } });
  }

  formatDate(date: string): string {
    return this.blogService.formatDate(date);
  }

  trackByArticleId(index: number, article: any): number {
    return article.id;
  }
}