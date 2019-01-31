import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Response } from '@angular/http';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from 'src/model/productsToAddInterface';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { title } from 'process';




@Injectable({
  providedIn: 'root'
})

export class DataService {
  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<any> {
    return this.http.get('http://localhost:4040/products');
  }

  getMilkyProducts(): Observable<any> {
    return this.http.get('http://localhost:4040/category/Milky');
  }

  getBreadProducts(): Observable<any>{
    return this.http.get('http://localhost:4040/category/Bread');

  }

/*
  getProductsByCatName(catname): Observable<any> {
    return this.http.get('http://localhost:4040/category/' + catname);
  } */

  getCategoriesNames(){
    console.log('Get Categories was called');
    return this.http.get('http://localhost:4040/categoriesnames')
  }

  //LATER FOR WORKING WITH INSERTING PRODUCTS
/*   upload(uploading: File) : Observable<any> {
    let data = new FormData();
    data.set('fileKey', uploading, uploading.name);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'image/jpg'
      })
    };
    return this.http.post('/upload', data);
  }
*/


createProduct(name: string, category: string, description: string, price: any, image:File){
    const theData = new FormData();
    theData.append("name", name);
    theData.append("category", category);
    theData.append("description", description);
    theData.append("price", price);
    theData.append("image", image, title);

    // const theNewProduct: Product = {name: name, category: category, description: description, price: price, image: image};
    const theNewProduct = {name: name, category: category, description: description, price: price, image: image};
    console.log("http post /newproduct has been called");
    console.log(theNewProduct);
    return this.http.post('http://localhost:4040/newproduct', theNewProduct)
    .subscribe(response => {
      console.log(response);
     });
  }


}
