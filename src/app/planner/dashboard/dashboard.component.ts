import { Component, OnInit } from '@angular/core';
import { User } from '../../user.model';
import { Subscription } from 'rxjs';
import { SocketService } from '../../socket.service';
import { MeetingService } from '../../meeting.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  authenticatedUser: User;
  private authenticationStatusSubscription: Subscription;

  users: User[];
  fetching = false;
  onlineUsers: any[];

  selectedDate = new Date(Date.now());
  formatViews: any;

  constructor(
    private socketService: SocketService,
    private meetingService: MeetingService
  ) {
    this.users = [];
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.socketService.onlineUsers.subscribe(users => {
      this.onlineUsers = users;
    });
    this.formatViews = { day: false, month: true, year: true };
  }

  onSelection(date: Date) {
    if (date) {
      this.selectedDate = date;
    }
  }

  private async getAllUsers() {
    try {
      this.fetching = true;
      this.users = (await this.meetingService.getAllNonAdminUsers()).users;
      this.fetching = false;
    }
    catch (err) {
      this.fetching = false;
      // request failed
      console.error(err);
    }
  }

  isOnline(userID: string) {
    const index = this.onlineUsers.findIndex(
      (x) => x.userID === userID
    );
    if (index === -1) {
      return false;
    } else {
      return true;
    }
  }
}
