import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { faUnlockAlt, faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../auth-common.scss']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  faEnvelopeOpen = faEnvelopeOpen;
  faUnlockAlt = faUnlockAlt;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.userLoginFailed.subscribe(() => {
      this.isLoading = false;
    });
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.userService.loginUser(form.value.email, form.value.password);
  }
}
