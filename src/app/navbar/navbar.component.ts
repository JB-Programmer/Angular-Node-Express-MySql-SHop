import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from './../../services/data.service';
import { ActivatedRoute, Route } from '@angular/router';


import {AuthService} from './../../services/auth.service';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  allCategoryNames: any;
  thelink;
  private authListenerSubs: Subscription;
  userIsAuthenticated = false;
  userIsAdmin = false;
  role: string;

  constructor(private getdata: DataService, private authService: AuthService, private theRoute: ActivatedRoute, private router: Router) { }


  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    if(this.userIsAuthenticated){
      this.role = this.authService.getRole();
      //console.log("EL ROOOOOOOOOOOOOOLEEEEEEEEEEEEEEEEEEEEEEE");
      //console.log(this.role);
      if(this.role === 'admin'){
        this.userIsAdmin = true;
      }
      this.router.navigate(['/category']);


    }

    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated =>{
        this.userIsAuthenticated = isAuthenticated;

    });

  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.role = null;
  }

  onLogout() {
    this.authService.logout();
    console.log("User has logged out successfully");
  }


  getCategorynames() {
    this.getdata.getCategoriesNames()
    .subscribe(
      res => {
        this.allCategoryNames = res;
        console.log(this.allCategoryNames[0].id);

      });
  }

}
