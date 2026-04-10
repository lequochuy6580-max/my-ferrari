import { Routes } from '@angular/router';
import { Home } from './home/home';
import { DetailComponent } from './detail/detail';
import { CartComponent } from './cart1/cart1';
import { ProductsListComponent } from './products-list/products-list';
import { Shop } from './shop/shop';
import { Checkout } from './checkout/checkout';
import { Viewdetail } from './viewdetail/viewdetail';
import { Login } from './login/login';
import { PaginationComponent } from './pagepagination/pagepagination';
import { Admin } from './admin/admin';
import { Register } from './register/register';
import { NewsList } from './news-list/news-list';
import { Component } from '@angular/core';
import { Blog } from './blog/blog';
import { Footer } from './footer/footer';
import { Profile } from './profile/profile';
import { authGuard, guestGuard } from './guards/auth.guards';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'detail', component: DetailComponent },
  { path: 'viewdetail', component: Viewdetail },

  // ── Chỉ cho khách chưa đăng nhập ──
  { path: 'login',    component: Login,    canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },

  // ── Cần đăng nhập ──
  { path: 'profile',  component: Profile,  canActivate: [authGuard] },

  // ── Route chung ──
  { path: 'cart',       component: CartComponent },
  { path: 'checkout',   component: Checkout },
  { path: 'shop',       component: Shop },
  { path: 'products',   component: ProductsListComponent },
  { path: 'pagination', component: PaginationComponent },
  { path: 'admin',      component: Admin },
  { path: 'news',       component: NewsList },
  { path: 'blog',       component: Blog },
  { path: 'blog/:id',   component: Blog },
  { path: 'component',  component: Component },
  { path: 'footer',     component: Footer },
  { path: '**', redirectTo: '' },
];