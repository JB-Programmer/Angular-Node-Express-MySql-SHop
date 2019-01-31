import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Response } from '@angular/http';

import { HttpClient, HttpHeaders } from '@angular/common/http';




@Injectable({
  providedIn: 'root'
})

export class CartService implements OnInit{
  constructor(private http: HttpClient) { }

  ngOnInit() {


  }


  getCartProductsByUserId() {
    console.log("Get products by user id has been called");
    return this.http.get('http://localhost:4040/checkifhascart');
  }

  addProductToCart(fullProductData){
    console.log("AddProductToCArt was called");
    return  this.http.post<{product: any}>('http://localhost:4040/producttocart', fullProductData)
      .subscribe(response => {
        console.log("Add product to call has been called");
        console.log(response);
      });
  }


  getTheCartId() {
    return  this.http.get('http://localhost:4040/getCartId')
    .subscribe(response => {
       console.log(response);
    });

  }

  closeTheCart() {
    return  this.http.get<{message: any}>('http://localhost:4040/closecart');
  }


  deleteProdFromCart(prod) {
    console.log(prod);
    return  this.http.post('http://localhost:4040/deleteproductfromcart', prod);

  }

/* createProduct(name: string, category: string, description: string, price: number, image: string){
    // const theNewProduct: Product = {name: name, category: category, description: description, price: price, image: image};
    const theNewProduct = {name: name, category: category, description: description, price: price, image: image};
    console.log("http post /newproduct has been called");
    console.log(theNewProduct);
    return this.http.post('http://localhost:4040/newproduct', theNewProduct)
    .subscribe(response => {
      console.log(response);
     });
  }
 */

}
