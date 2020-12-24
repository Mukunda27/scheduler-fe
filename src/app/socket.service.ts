import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';

import { environment } from '../environments/environment';

const BACKEND_URL = environment.socketUrl;

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private allOnlineUsers: any[];
  onlineUsers = new BehaviorSubject<any[]>(this.allOnlineUsers);

  constructor(private notificationService: NotificationService) {
  }

  setupSocketConnection(authToken: string) {
    this.socket = io(BACKEND_URL, { forceNew: true });
    this.setUser(authToken);

    this.socket.on('socket-disconnected', () => {
      this.disconnectSocket();
    });

    this.socket.on('online-users', (data: any) => {
      this.allOnlineUsers = data;
      this.onlineUsers.next(this.allOnlineUsers);
    });

    this.socket.on('notify-meeting-created', (message: string) => {
      this.notificationService.showMessageNotification(message);
    });

    this.socket.on('meeting-reminder', (message: string) => {
      console.log('meet reminder');
      this.notificationService.showReminderNotification(message);
    });
  }

  disconnectSocket() {
    this.socket.disconnect();
  }

  notifyMeeting(message: string, userID: string) {
    const messageDetails = { message, userID };
    this.socket.emit('meeting-created', messageDetails);
  }

  setUser(authToken: string) {
    this.socket.emit('set-user', authToken);
  }
}
