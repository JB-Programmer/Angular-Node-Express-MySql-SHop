import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {

  }

  // Intercept outgoing requests. Next allows to continue in Angular too
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();
    console.log("INTERCEPT IS WORKINGGG!!!!!!!!! This is the authToken:");
    //console.log(authToken);

    const authRequest = req.clone({
      // I add the token to the original requests header.
      // The authorization is the same word I used in the middleware to send it in the header
      headers: req.headers.set('authorization', "Bearer " + authToken)
    });


    return next.handle(authRequest);


  }



}
