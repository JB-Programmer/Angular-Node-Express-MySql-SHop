import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';


/* import { AuthGuard } from './services/auth-guard.service'; */
/* import { UserService } from './services/user.service'; */
/* import { CartService } from './services/cart.service'; */
/* import { DateFormatPipe } from './dateFormat.pipe'; */


import { AppComponent } from './app.component';


// Services
import { DataService } from '../services/data.service';
import { CartService } from 'src/services/cart.service';
import { AuthGuard } from 'src/services/auth.guard';

// Components
import { NavbarComponent } from './navbar/navbar.component';
import { CategoryPageComponent } from './category-page/category-page.component';
import { LoginComponent } from './login/login.component';
import { NewUserComponent } from './new-user/new-user.component';
import { AddProductComponent } from './add-product/add-product.component';
import {AuthInterceptor} from './../services/auth.interceptor';
import { CartComponent } from './cart/cart.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CategoryPageComponent,
    LoginComponent,
    NewUserComponent,
    AddProductComponent,
    CartComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot([

      {
        path: 'category',
        component: CategoryPageComponent, canActivate: [AuthGuard],
        children: [
          {path: '', component: CategoryPageComponent},
          {path: 'Milky', component: CategoryPageComponent},
          {path: 'Bread', component: CategoryPageComponent},
        ]
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'newuser',
        component: NewUserComponent
      },
      {
        path: 'addproduct',
        component: AddProductComponent
      },
      {
        path: 'mycart',
        component: CartComponent,
        canActivate: [AuthGuard]
      },
      {
        path: '',
        component: LoginComponent
      },
    ]),
  ],
  providers: [
      DataService,
      CartService,
      AuthGuard,
      {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}

    ],
  bootstrap: [AppComponent]
})

export class AppModule { }
