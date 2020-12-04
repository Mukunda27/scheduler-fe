import { Component, OnInit } from '@angular/core';
import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss', '../auth-common.scss']
})
export class NewPasswordComponent implements OnInit {
  faUnlockAlt = faUnlockAlt;
  resetToken: string;
  isLoading = false;
  passwordChangeSuccess = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService) {
    this.route.params.subscribe(params => {
      this.resetToken = params.token;
    });
  }

  ngOnInit(): void {
  }

  changePassword(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const newPassword = form.value.newPassword;
    const confirmPassword = form.value.confirmPassword;

    if (confirmPassword !== newPassword) {
      const errorMessage = 'Passwords entered is not identical. Try again';
      this.notificationService.showErrorNotification(errorMessage);
      form.reset();
      return;
    }

    this.isLoading = true;
    this.userService.resetPassword(this.resetToken, newPassword, confirmPassword).subscribe(response => {
      this.isLoading = false;
      if (response.resetSuccess) {
        this.passwordChangeSuccess = response.resetSuccess;
        console.log('reset success');
      }
    }, error => {
      this.isLoading = false;
      let errorMessage = 'Something went wrong. Please try again';
      if (error.message) {
        errorMessage = error.message;
      }
      this.notificationService.showErrorNotification(errorMessage);
    });
  }
}
