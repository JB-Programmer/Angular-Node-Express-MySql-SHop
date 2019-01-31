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
  userData;

  // tslint:disable-next-line:max-line-length
  constructor( private authService: AuthService, private cartservice: CartService, private theRoute: ActivatedRoute, private router: Router ) {

  }

  ngOnInit() {
      this.getProducts();
      this.giveMeData();
      //this.userData = theData[0];
      //console.log("This is the user data");

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


  giveMeData(){
    this.authService.userFullData()
    .subscribe(res=>{
      this.userData = res[0];
      console.log("Res.data[0]")
      console.log(res[0]);
      console.log(this.userData);
    });
  }

  onOrder(){
    this.cartservice.closeTheCart()
    .subscribe(res=>{
      //console.log("esta es la respuesta del servidor");
      //console.log(res.message);
      if(res.message = 'carritoCerrado'){
        console.log("Carrito cerrado");
        alert("Your cart has been closed successfully");
      }else{
        console.log("Error al cerrar el carrito");
      }
    });


  }

  startShipping(){
    this.router.navigate(['/category']);

  }

}
