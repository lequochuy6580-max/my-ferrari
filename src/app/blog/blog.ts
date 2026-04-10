import { Component, Inject, PLATFORM_ID, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, Footer],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog {
  article: any = null;
  relatedArticles: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // afterNextRender: chạy 1 lần sau khi browser hydrate xong
    // Giải quyết vấn đề SSR render isLoading=true rồi browser không re-trigger
    afterNextRender(() => {
      this.route.queryParamMap.subscribe(params => {
        const rawId = params.get('id');
        const articleId = rawId ? Number(rawId) : null;

        if (!articleId || isNaN(articleId)) {
          this.error = 'Article not found. Invalid or missing ID.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.article = null;
        this.relatedArticles = [];
        this.loadArticle(articleId);
      });
    });
  }

  private async loadArticle(id: number) {
    try {
      this.isLoading = true;
      this.error = null;
      this.cdr.detectChanges();

      const articles = await this.blogService.fetchArticles();

      if (!articles || articles.length === 0) {
        this.error = 'No articles available.';
        return;
      }

      const found = articles.find((a: any) => a.id === id);

      if (!found) {
        this.error = `Article with ID ${id} was not found.`;
        return;
      }

      this.article = found;
      this.relatedArticles = articles
        .filter((a: any) => a.category === found.category && a.id !== found.id)
        .slice(0, 3);

    } catch (err) {
      console.error('Error loading article:', err);
      this.error = 'Failed to load article. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  goBack() {
    this.router.navigate(['/news']);
  }

  goToArticle(articleId: number) {
    this.router.navigate(['/blog'], { queryParams: { id: articleId } });
  }

  formatDate(date: string): string {
    return this.blogService.formatDate(date);
  }

  trackById(index: number, article: any): number {
    return article.id;
  }
}