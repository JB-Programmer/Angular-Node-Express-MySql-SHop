import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from './../../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  user: any;
  theemail: string;
  thepassword: string;
  message;

  constructor(private authService: AuthService) { }


  onLogin(form: NgForm) {
    console.log('LoginFunction from auth service has been called');
    console.log(form.valid);
    console.log(this.theemail);
    console.log(this.thepassword);
    //console.log(form.value.thepassword);
    //console.log(form.value.theemail);


    if (!form.valid) {
      console.log('Not valid form');
      return;
    } else {
      console.log('Valid form');
      this.authService.login(form.value.theemail, form.value.thepassword);
    }

  }



  ngOnInit() {
  }

}
