import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { DataService } from './../../services/data.service';
import { ActivatedRoute, ROUTER_CONFIGURATION, ParamMap } from '@angular/router';
import {AuthService } from '../../services/auth.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  form: FormGroup;
  theproductname: string;
  // TODO EASY TO BRING AL THE CATEGORIES AND PUT IT LIKE AN INPUT SELECTOR
  thecategories: any;
  thedescription: string;
  theprice: any;
  thecategory: any;
  theproductid;
  imagePreview;
  private mode = 'create';
  private productId: string;

  @Output() productCreated = new EventEmitter();

  constructor( private authService: AuthService, private dataService: DataService, private myRoute: ActivatedRoute ) { }

  ngOnInit() {
    this.form = new FormGroup({
      'theproductname': new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]
      }),
      'thedescription': new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]
      }),
      'theprice': new FormControl(null, {validators: [Validators.required, Validators.minLength(1)]
      }),
      'thecategory': new FormControl(null, {validators: [Validators.required, Validators.minLength(2)]
      }),
      'image' : new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });

    this.myRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('productId')) {
/*         this.mode = "edit";
        this.productId = paramMap.get('productId');
        this.dataService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.product = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        }); */
      } else {
        /* this.mode = "create";
        this.postId = null; */
      }
    });

    this.dataService.getCategoriesNames()
    .subscribe(res=> {
      this.thecategories = res;
    })
  }

  onAddProduct() {
    //const therole = this.authService.getRole();
    console.log('On Add Product Called this is the data that goes to form');
    console.log(this.form.value);

    if (this.form.invalid) {
      console.log('Form invalid');
      return;
    }
    // tslint:disable-next-line:max-line-length
    this.dataService.createProduct(this.form.value.theproductname, this.form.value.thecategory, this.form.value.thedescription, this.form.value.theprice, this.form.value.image);
    this.form.reset();
    console.log('Product added successfully');
    return;


  }


  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = <string>reader.result;
    };
    reader.readAsDataURL(file);
  }
}





/* import { Component, OnInit, EventEmitter, Output } from '@angular/core';
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
 */
