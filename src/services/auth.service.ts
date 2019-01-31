import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserDataFull } from './../app/new-user/new-user-class';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private isAuthenticatedNow = false;
  private token: string;
  private fullResponse: any;
  private userName: string;
  private userEmail: string;
  private tokenTimer: any;
  private theReceivedMessage: string;
  private userId: string;
  private userRole: string;
  private authStatusListener = new Subject<boolean>();
  private city: string;
  private street: string;



  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    console.log('Get token() has been called and this is the token:');
    console.log(this.token);
    return this.token;
  }

  getData () {
    return {
      role: this.userRole,
      name : this.userName,
      email : this.userEmail,
      id: this.userId
    };
  }

  getRole() {
    return this.userRole;
  }

  getIsAuth(){
    return this.isAuthenticatedNow;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  getFullResponse() {
    return this.fullResponse;
  }

  // tslint:disable-next-line:max-line-length
  createUser(name: string, surname: string, username: string, password: string, email: string, zehut: number, street: string, city: string) {
    // tslint:disable-next-line:max-line-length
    const theDataObject: UserDataFull = {name: name, surname: surname, username: username, password: password, email: email, zehut: zehut, street: street, city: city };
    this.http.post('http://localhost:4040/signupuser', theDataObject)
    .subscribe(response => {
      console.log(response);
    });
  }


  login(email: string, password: string) {
    const theDataObject = {email: email, password: password };
    // tslint:disable-next-line:max-line-length
    this.http.post<{token: string, expiresIn:number, email:string, name: string; userid: string; role:string; }>('http://localhost:4040/login', theDataObject)
          .subscribe(response => {
           /*  this.fullResponse = res.json();
            this.token = res.json().token;
            //this.token = res.token;

            console.log("USER HAS BEEN LOGGED. TOKEN:" + this.token); */
            //this.token = response.token;
            //console.log("This is the response of the console log after login");
            const token = response.token;
            this.token = token;
            if(token) {
              this.userRole = response.role;
              this.userEmail = response.email;
              this.userName = response.name;
              this.userId = response.userid;
              //console.log(this.userEmail);
              const expiresInDuration = response.expiresIn;
              //Function that logout after the expires in wrotten in the json that the server retrieves. I pass from seconds to miliseconds *1000
              this.setAuthTimer(expiresInDuration);
              console.log(expiresInDuration);
              this.isAuthenticatedNow = true;
              //console.log(response);
              this.authStatusListener.next(true);
              const now = new Date();
              const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
              this.saveAuthData(token, expirationDate, this.userRole);
              this.router.navigate(['/category']);

            }else{

              this.theReceivedMessage = "User or Password invalid";
              console.log(this.theReceivedMessage);

            }

          });

  }

  getErrorMessage(){
    return this.theReceivedMessage;
  }

  userFullData(){
    return this.http.get<{data:any}>('http://localhost:4040/getUserInfo');
  }

  logout() {
    this.token = null;
    this.isAuthenticatedNow = false;
    this.authStatusListener.next(false);
    this.userRole = 'null';
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    console.log('Client has logged out');

    this.router.navigate(['/login']);
  }

  private setAuthTimer(duration: number){

    console.log('Setting timer ' + duration)
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }


  //Saving in localstorage
  private saveAuthData(token: string, expirationDate: Date, role:string) {
    localStorage.setItem('token',  token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem("userRole", role);

  }

  //Remove from localstorage
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem("userRole");

  }


  //
  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.userRole = authInformation.userRole;
      this.token = authInformation.token;
      this.isAuthenticatedNow = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      console.log('User has been authenticated automatically with his token');
    }



  }



  //Getting data from localstorage.
  private getAuthData(){
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userRole = localStorage.getItem('userRole')
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userRole: userRole
    }
  }

}
