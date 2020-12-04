import { Component, OnInit } from '@angular/core';
import { faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons';
import { NgForm } from '@angular/forms';
import { UserService } from '../../user.service';
import { NotificationService } from '../../notification.service';


@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss', '../auth-common.scss']
})
export class PasswordResetComponent implements OnInit {
  resetMail: string;
  isLoading = false;
  faEnvelopeOpen = faEnvelopeOpen;
  constructor(private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
  }

  onReset(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.userService.passwordResetRequest(form.value.email).subscribe(response => {
      if (response.resetEmail) {
        this.isLoading = false;
        this.resetMail = response.resetEmail;
      }
    }, () => {
      this.isLoading = false;
      const errorMessage = 'Something went wrong. Please try again';
      this.notificationService.showErrorNotification(errorMessage);
    });
  }
}
