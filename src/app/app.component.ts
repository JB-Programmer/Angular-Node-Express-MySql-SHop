import { Component, OnInit, Input } from '@angular/core';
import { DataService } from './../services/data.service';
import { AuthService } from 'src/services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent implements OnInit {

  products: any;
  productsByCat: any;

  constructor(private getdata: DataService, private authService: AuthService) { }

  ngOnInit() {
    //this.getProducts();
    this.authService.autoAuthUser();

  }

  getProducts() {
    this.getdata.getAllProducts()
    .subscribe(
      res => {
          /*         this.products = res.json();
          */
          this.products = res;
      });
  }



}
