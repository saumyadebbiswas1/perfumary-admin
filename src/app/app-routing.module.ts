import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrandAddComponent } from './brand-add/brand-add.component';
import { BrandEditComponent } from './brand-edit/brand-edit.component';
import { BrandListComponent } from './brand-list/brand-list.component';
import { CategoryAddComponent } from './category-add/category-add.component';
import { CategoryEditComponent } from './category-edit/category-edit.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { ProductAddComponent } from './product-add/product-add.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { ProductListComponent } from './product-list/product-list.component';

const routes: Routes = [
  {
    path: '',
    component: HeaderComponent,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'product-add',
        component: ProductAddComponent,
      },
      {
        path: 'product-list',
        component: ProductListComponent,
      },
      {
        path: 'product-edit/:productId',
        component: ProductEditComponent,
      },
      {
        path: 'category-add',
        component: CategoryAddComponent,
      },
      {
        path: 'category-list',
        component: CategoryListComponent,
      },
      {
        path: 'category-edit/:categoryId',
        component: CategoryEditComponent,
      },
      {
        path: 'brand-add',
        component: BrandAddComponent,
      },
      {
        path: 'brand-list',
        component: BrandListComponent,
      },
      {
        path: 'brand-edit/:brandId',
        component: BrandEditComponent,
      },
    ]
  },
  // {
  //   path:"**",
  //   component: NotFound404Component
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
