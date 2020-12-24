import { Component, OnInit, ViewChild, OnDestroy, } from '@angular/core';
import { IgxCalendarComponent } from 'igniteui-angular';
import { CalendarEvent, CalendarEventAction } from 'angular-calendar';

import { faMapMarkerAlt, faUser, faChevronCircleLeft, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { colors } from './colors';
import { MeetingNotifierService } from '../meeting-notifier.service';
import { User } from '../../user.model';
import { Subscription, Subject } from 'rxjs';
import { UserService } from '../../user.service';
import { ActivatedRoute } from '@angular/router';
import { MeetingService } from '../../meeting.service';
import { SocketService } from '../../socket.service';
import { Meeting } from '../../meeting';

import differenceInMinutes from 'date-fns/differenceInMinutes';
import format from 'date-fns/format';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit, OnDestroy {
  faUser = faUser;
  faMapMarkedAlt = faMapMarkerAlt;
  faChevronCircleLeft = faChevronCircleLeft;
  faTrashAlt = faTrashAlt;

  calendarUserID: string;
  authenticatedUser: User;
  deleting = false;
  private authenticationStatusSubscription: Subscription;
  private paramsSubscription: Subscription;

  @ViewChild('calendar') public calendar: IgxCalendarComponent;

  viewDate: Date = new Date();
  selectedDate = new Date(Date.now());
  formatViews: any;
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  eventsTimer: NodeJS.Timer[] = [];

  constructor(
    private meetingNotifier: MeetingNotifierService,
    private userService: UserService,
    private meetingService: MeetingService,
    private route: ActivatedRoute,
    private socketService: SocketService) {
    this.events = [];
  }

  ngOnInit(): void {
    this.paramsSubscription = this.route.params.subscribe(params => {
      this.calendarUserID = params.id;
      this.getAllMeetings();
    });

    this.authenticationStatusSubscription = this.userService.authenticatedUser
      .subscribe(user => {
        this.authenticatedUser = user;
      });

    this.meetingNotifier.meetingCreated.subscribe(() => {
      this.getAllMeetings();
    });

    this.formatViews = { day: false, month: true, year: true };
  }

  onSelection(date: Date) {
    if (date) {
      this.selectedDate = date;
      this.viewDate = date;
      this.getAllMeetings();
    }
  }

  smallEvent(event: CalendarEvent): boolean {
    return event.meta.small;
  }

  openCreateMeetingDialog() {
    const dialogData = { userID: this.calendarUserID, editMode: false, isAdmin: this.authenticatedUser.admin, meetingDetails: null };
    this.meetingNotifier.openDialog.next(dialogData);
  }

  ngOnDestroy() {
    this.authenticationStatusSubscription.unsubscribe();
    this.paramsSubscription.unsubscribe();
  }

  private async getAllMeetings() {
    try {
      const meetings = (await this.meetingService.getAllMeetings(this.calendarUserID, this.selectedDate)).meetings;
      this.events = [];
      this.eventsTimer.forEach(timer => {
        clearTimeout(timer);
      });
      this.eventsTimer = [];
      meetings.map(meeting => {
        const colorIndex = Math.floor((Math.random() * 4));
        const event: CalendarEvent = {
          start: meeting.startTime,
          end: meeting.endTime,
          title: meeting.title,
          color: colors[colorIndex],
          meta: {
            small: differenceInMinutes(meeting.endTime, meeting.startTime) <= 30 ? true : false,
            creator: meeting.creator,
            location: meeting.location,
            id: meeting.id,
            formattedTime: format(meeting.startTime, 'HH:mm'),
            duration: this.getDuration(meeting)
          }
        };
        this.events.push(event);
        this.setEventRemainder(meeting);
      });
      this.refresh.next();
    }
    catch (err) {
      console.error(err);
    }
  }

  setEventRemainder(meeting: Meeting) {

  }

  getDuration(meeting: Meeting) {
    const durationInMinutes = differenceInMinutes(meeting.endTime, meeting.startTime);
    return ('00' + Math.floor(durationInMinutes / 60)).slice(-2) +
      'h ' +
      ('00' + (durationInMinutes % 60)).slice(-2) + 'm';
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    if (this.deleting) {
      return;
    }
    const dialogData = {
      userID: this.calendarUserID,
      editMode: true,
      isAdmin: this.authenticatedUser.admin,
      meetingDetails: {
        id: event.meta.id,
        title: event.title,
        date: event.start,
        startTime: event.start,
        endTime: event.end,
        location: event.meta.location
      }
    };
    this.meetingNotifier.openDialog.next(dialogData);
  }

  deleteEvent(id: string, title: string) {
    this.deleting = true;
    this.meetingService.deleteMeeting(id).subscribe(response => {
      this.deleting = false;
      this.getAllMeetings();
      this.socketService.notifyMeeting(`Meeting Removed - ${title}`, this.calendarUserID);

    }, error => {
      console.log(error);
    });
  }
}
