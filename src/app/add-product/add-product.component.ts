import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {NgForm} from '@angular/forms';
import { DataService } from './../../services/data.service';
import { ActivatedRoute, ROUTER_CONFIGURATION } from '@angular/router';
import {AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {

  theproductname: string;
  // TODO EASY TO BRING AL THE CATEGORIES AND PUT IT LIKE AN INPUT SELECTOR
  thecategories: any;
  thedescription: string;
  theprice: number;
  thecategory: any;
  theproductid;
  @Output() productCreated = new EventEmitter();

  constructor( private authService: AuthService, private dataService: DataService, private myRoute: ActivatedRoute ) { }

  ngOnInit() {
    this.dataService.getCategoriesNames()
    .subscribe(res=> {
      this.thecategories = res;
    })
  }

  onAddProduct(form: NgForm) {
    const therole = this.authService.getRole();
    if (true) {
      console.log(form.value);
      // tslint:disable-next-line:max-line-length
      this.dataService.createProduct(form.value.productName, form.value.thecategory, form.value.thedescription, form.value.theprice, form.value.theimage);
      form.reset();
      return;

    } else {

      //console.log(form.value);
      // tslint:disable-next-line:max-line-length

      // tslint:disable-next-line:max-line-length

      // Despues de haber sido creado el objeto, quiero pasar el post completo como argumento
      //this.productCreated.emit(product);
    }

  }
}
