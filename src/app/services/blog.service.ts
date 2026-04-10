import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor(private apiService: ApiService) {}

  async fetchArticles(): Promise<any[]> {
    return await this.apiService.getArticles();
  }

  async getArticlesByCategory(category: string): Promise<any[]> {
    const articles = await this.fetchArticles();
    if (category === 'all') {
      return articles;
    }
    return articles.filter(article => article.category === category);
  }

  async getLatestArticles(limit: number = 3): Promise<any[]> {
    const articles = await this.fetchArticles();
    return articles
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getArticleById(id: any): Promise<any> {
    return await this.apiService.getArticleById(id);
  }

  formatDate(dateString: string): string {
    const options: any = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  }

  getCategories(articles: any[]): string[] {
    const categories = new Set(articles.map(a => a.category));
    return Array.from(categories) as string[];
  }
}
