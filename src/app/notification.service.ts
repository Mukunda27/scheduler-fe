import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  showMessage = new Subject<string>();
  showError = new Subject<string>();
  showReminder = new Subject<string>();

  constructor() { }

  public showMessageNotification(message: string) {
    this.showMessage.next(message);
  }

  public showErrorNotification(message: string) {
    this.showError.next(message);
  }

  public showReminderNotification(message: string) {
    this.showReminder.next(message);
  }
}
