import { Component, OnInit, OnDestroy } from '@angular/core';
import { faChevronDown, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { UserService } from '../../user.service';
import { User } from '../../user.model';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  faChevronDown = faChevronDown;
  faPowerOff = faPowerOff;

  authenticatedUser: User;
  private authenticationStatusSubscription: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.authenticationStatusSubscription = this.userService.authenticatedUser
      .subscribe(user => {
        this.authenticatedUser = user;
      });
  }

  logout() {
    this.userService.logout(this.authenticatedUser);
  }

  ngOnDestroy() {
    this.authenticationStatusSubscription.unsubscribe();
  }
}
