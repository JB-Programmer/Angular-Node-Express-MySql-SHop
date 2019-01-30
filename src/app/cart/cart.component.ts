import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../services/auth.service';

import { CartService } from './../../services/cart.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  products: any;
  screen = '1';

  // tslint:disable-next-line:max-line-length
  constructor( private authService: AuthService, private cartservice: CartService, private theRoute: ActivatedRoute, private router: Router ) {

  }

  ngOnInit() {
      this.getProducts();
  }



  getProducts() {
    this.cartservice.getCartProductsByUserId()
    .subscribe(
      res => {
        //this.products = res;
        console.log("Products of this cart have been retrieved");
        console.log(res);
        this.products = res;
        //console.log("These are the products" + this.products);




      });
  }

  deleteProductFromCart(product) {
    //alert("This is the product ID in the list of all products of our shop" + product.productId);
    this.cartservice.deleteProdFromCart(product)
    .subscribe(res => {
      console.log("PRODDUCT DELETED");
    });
    this.getProducts();
  }


  checkout() {
    //Change the screen
    this.screen = '2';



  }


  backToCart() {
    this.screen = '1';
  }


}
