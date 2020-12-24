import { Component, OnInit, ɵbypassSanitizationTrustResourceUrl } from '@angular/core';
import { faBell, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from 'src/app/notification.service';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  faBell = faBell;
  faTimes = faTimes;
  faExclamationCircle = faExclamationCircle;

  showMessage = false;
  showError = false;
  showReminder = false;

  message: string;
  error: string;
  reminder: string;

  private notificationTimer: NodeJS.Timer;
  private snozeTimer: NodeJS.Timer;

  constructor(private notificationService: NotificationService) {

  }

  ngOnInit(): void {
    this.notificationService.showMessage.subscribe(message => {
      this.showMessageNotification(message);
    });
    this.notificationService.showError.subscribe(error => {
      this.showErrorNotification(error);
    });
    this.notificationService.showReminder.subscribe(reminder => {
      this.showReminderNotification(reminder);
    });
  }

  showMessageNotification(message: string) {
    this.message = message;
    this.showError = false;
    this.showReminder = false;
    this.showMessage = true;

    this.clearTimer();

    this.notificationTimer = setTimeout(() => {
      this.showMessage = false;
    }, 6000);
  }

  showErrorNotification(error: string) {
    this.error = error;
    this.showMessage = false;
    this.showReminder = false;
    this.showError = true;
    this.clearTimer();
    this.notificationTimer = setTimeout(() => {
      this.showError = false;
    }, 6000);
  }

  showReminderNotification(reminder: string) {
    this.reminder = reminder;
    this.showMessage = false;
    this.showError = false;
    this.showReminder = true;
    this.clearTimer();

    this.notificationTimer = setTimeout(() => {
      this.showReminder = false;
    }, 6000);
  }

  clearTimer() {
    clearTimeout(this.notificationTimer);
    clearTimeout(this.snozeTimer);
  }

  closeMessage() {
    this.showMessage = false;
    clearTimeout(this.notificationTimer);
  }

  closeError() {
    this.showError = false;
    clearTimeout(this.notificationTimer);
  }

  closeReminder() {
    this.showReminder = false;
    clearTimeout(this.notificationTimer);
    clearTimeout(this.snozeTimer);
  }

  snoozeReminder() {
    this.showReminder = false;
    clearTimeout(this.notificationTimer);
    clearTimeout(this.snozeTimer);

    this.snozeTimer = setTimeout(() => {
      this.showReminderNotification(this.reminder);
    }, 5000);
  }
}
