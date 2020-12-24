import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../../user.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()
export class DashboardGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    boolean | Observable<boolean> | Promise<boolean> {
    return this.isAdminUser();
  }

  isAdminUser(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.userService.authenticatedUser.subscribe(user => {
        if (user && user.admin) {
          resolve(true);
        } else {
          this.router.navigate(['/planner/calendar', user.userID]);
          reject(false);
        }
      });
    });
  }
}
