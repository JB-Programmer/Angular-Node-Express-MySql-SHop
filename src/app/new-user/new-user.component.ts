import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { ActivatedRoute, ROUTER_CONFIGURATION } from '@angular/router';
import { formArrayNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';

@Component ({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  thename: string;
  thesurname: string;
  theusername: string;
  thepassword: string;
  theemail: string;
  thezehut: number;
  thestreet: string;
  thecity: string;




  constructor( private authService: AuthService, private myRoute: ActivatedRoute ) { }

  ngOnInit() {
  }


  onSignUp(form: NgForm) {
    if (form.invalid) {
      console.log('Form is invalid');
      return;
    } else {
      // Todo: here I can check if email already exisst or not...
      // console.log(form.value);
      // tslint:disable-next-line:max-line-length
      this.authService.createUser(form.value.thename, form.value.thesurname, form.value.theusername, form.value.thepassword, form.value.theemail, form.value.thezehut, form.value.thestreet, form.value.thecity);
      form.reset();
    }

  }

}
