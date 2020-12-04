import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from './user.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';
import { NotificationService } from './notification.service';
import { environment } from '../environments/environment';

const BACKEND_URL = environment.apiUrl + 'user/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isAuthenticated = false;
  private authenticatedUser = new BehaviorSubject<User>(null);
  userCreationFailed = new Subject<void>();
  userLoginFailed = new Subject<void>();
  private tokenTimer: NodeJS.Timer;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private socketService: SocketService,
    private notificationService: NotificationService) { }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  observeAuthenticationStatus() {
    return this.authenticatedUser.asObservable();
  }

  autoLogin() {
    const authenticationInformation = this.fetchAuthenticationToken();
    if (!authenticationInformation.token ||
      !authenticationInformation.expirationDate ||
      !authenticationInformation.userID) {
      return;
    }

    const expiresIn = authenticationInformation.expirationDate.getTime() - new Date().getTime();
    if (expiresIn > 0) {
      this.httpClient.get<{ name: string, userID: string, email: string, admin: boolean }>
        (BACKEND_URL + authenticationInformation.userID).subscribe(response => {
          this.handleUserAuthentication(response.name, response.userID,
            response.email, response.admin, authenticationInformation.token, expiresIn / 1000);
        }, error => {
          this.userLoginFailed.next();
          let errorMessage = 'Something is broken. Try again after some time';
          if (error.error.message) {
            errorMessage = error.error.message;
          }
          this.notificationService.showErrorNotification(errorMessage);
        });
    }
  }

  createUser(name: string, phone: string, email: string, password: string, admin: boolean) {
    const signupData = { name, phone, email, password, admin };
    this.httpClient.post(BACKEND_URL + 'create', signupData)
      .subscribe(response => {
        this.loginUser(email, password);
      }, error => {
        this.userCreationFailed.next();
        if (this.isEmailNotUnique(error)) {
          this.notificationService.showErrorNotification('Account with this email already exists');
        } else {
          this.notificationService.showErrorNotification('Something is broken. Try again after some time');
        }
      });
  }

  loginUser(email: string, password: string) {
    const loginDetails = { email, password };

    this.httpClient.post<{ name: string, userID: string, email: string, admin: boolean, token: string, expiresIn: number }>
      (BACKEND_URL + 'login', loginDetails)
      .subscribe(response => {
        if (response.token) {
          this.handleUserAuthentication(response.name, response.userID, response.email, response.admin, response.token, response.expiresIn);
        }
      }, error => {
        this.userLoginFailed.next();
        let errorMessage = 'Something is broken. Try again after some time';
        if (error.error.message) {
          errorMessage = error.error.message;
        }
        this.notificationService.showErrorNotification(errorMessage);
      });
  }

  passwordResetRequest(email: string) {
    const resetDetails = { email };
    return this.httpClient.post<{ message: string, resetEmail: string }>
      (BACKEND_URL + 'password-reset-request', resetDetails);
  }

  logout(user: User): void {
    localStorage.clear();
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.authenticatedUser.next(null);
    this.socketService.disconnectSocket();
    this.goToSignIn();
  }

  validatePasswordResetToken(resettoken: string) {
    const resetPasswordToken = { resettoken };

    return this.httpClient.post<{ validToken: boolean }>
      (BACKEND_URL + 'valid-password-reset-token', resetPasswordToken);
  }

  resetPassword(resettoken: string, newPassword: string, confirmedPassword: string) {
    const resetDetails = { resettoken, newPassword, confirmedPassword };

    return this.httpClient.post<{ resetSuccess: boolean }>
      (BACKEND_URL + 'reset-password', resetDetails);
  }

  private handleUserAuthentication(name: string, userID: string, email: string, admin: boolean, token: string, expiresIn: number) {
    this.isAuthenticated = true;
    const authenticatedUser: User = { name, email, userID, admin };

    this.socketService.setupSocketConnection(token);
    this.storeAuthenticationToken(userID, token, expiresIn);

    this.tokenTimer = setTimeout(() => {
      this.logout(authenticatedUser);
    }, expiresIn * 1000);

    this.router.navigate(['/']);
    this.authenticatedUser.next(authenticatedUser);
  }

  private goToSignIn() {
    this.router.navigate(['/']);
  }

  private isEmailNotUnique(error: HttpErrorResponse): boolean {
    if (error.error.error.errors.email.kind) {
      return error.error.error.errors.email.kind === 'unique';
    }

    return false;
  }

  private storeAuthenticationToken(userID: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    console.log('storeAuthenticationToken');

    localStorage.setItem('authenticatedUserID', userID);
    localStorage.setItem('authenticationToken', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
  }

  fetchAuthenticationToken(): { userID: string, token: string, expirationDate: Date } {
    const userID = localStorage.getItem('authenticatedUserID');
    const token = localStorage.getItem('authenticationToken');
    const expirationDate = localStorage.getItem('expirationDate');

    return { userID, token, expirationDate: new Date(expirationDate) };
  }
}

