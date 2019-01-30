import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { DataService } from './../../services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CartService } from 'src/services/cart.service';





@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.css']
})
export class CategoryPageComponent implements OnInit {
  productsByCat: any;
  categoryps;
  theCategory;

  constructor( private getdata: DataService, private theRoute: ActivatedRoute, private router: Router, private cartService: CartService ) {

  }

  ngOnInit() {

    this.theRoute.queryParams.subscribe(params => {
      this.getMilk();
      this.theCategory = "Milky products";

    });


  }


  getMilk() {
    this.getdata.getMilkyProducts()
    .subscribe(
      res => {
        this.productsByCat = res;
        console.log("Milk products retrieved");
        this.theCategory = "Milky products";
      });
  }

  getBread(){
    this.getdata.getBreadProducts()
    .subscribe(
      res => {
        this.productsByCat = res;
        console.log("Bread product retrieved");
        this.theCategory = "Bread products";
      });
  }


  addProduct(product) {
    console.log(product);
    this.cartService.addProductToCart(product);

  }

  deleteProduct(product){
    alert("Admin wants to delete thisp product: " + product.id);
  }
/*
  getProdByCatName(category) {
    this.getdata.getProductsByCatName(category)
    .subscribe(
      res => {
        this.productsByCat = res.json();
      });
  }
  */




}
