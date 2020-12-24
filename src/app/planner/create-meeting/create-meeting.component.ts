import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NotificationService } from '../../notification.service';
import { IgxTimePickerComponent, IgxTimePickerValueChangedEventArgs } from 'igniteui-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { MeetingNotifierService } from '../meeting-notifier.service';
import { MeetingService } from '../../meeting.service';
import { Meeting } from '../../meeting';
import { SocketService } from '../../socket.service';

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.scss']
})
export class CreateMeetingComponent implements OnInit {
  meetingForm: FormGroup;
  startTime: string;
  endTime: string;
  calendarUserID: string;
  editMode = false;
  isAdmin = false;

  meetingDetails: any;
  meetingCreationProgress = false;
  isSubmitted = false;
  date: Date = new Date();

  @ViewChild('timePicker1') private startTimePicker: IgxTimePickerComponent;
  @ViewChild('timePicker2') private endTimePicker: IgxTimePickerComponent;

  private dayFormatter = new Intl.DateTimeFormat('en', { weekday: 'long' });
  private monthFormatter = new Intl.DateTimeFormat('en', { month: 'long' });

  public formatter = (date: Date) => {
    return `${this.dayFormatter.format(date)}, ${date.getDate()} ${this.monthFormatter.format(date)}, ${date.getFullYear()}`;
  }

  constructor(
    public element: ElementRef,
    private meetingService: MeetingService,
    private notificationService: NotificationService,
    private meetingNotifier: MeetingNotifierService,
    private socketService: SocketService) { }

  ngOnInit(): void {
    this.meetingForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      date: new FormControl(),
      startTime: new FormControl('', [Validators.required]),
      endTime: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required])
    });

    this.meetingNotifier.openDialog.subscribe((dialogData) => {
      this.calendarUserID = dialogData.userID;
      this.editMode = dialogData.editMode;
      this.isSubmitted = false;
      this.isAdmin = dialogData.isAdmin;


      this.meetingForm.reset();
      if (dialogData.editMode && dialogData.meetingDetails) {
        this.meetingDetails = dialogData.meetingDetails;
        this.meetingForm.patchValue({
          title: dialogData.meetingDetails.title,
          date: dialogData.meetingDetails.date,
          startTime: dialogData.meetingDetails.startTime,
          endTime: dialogData.meetingDetails.endTime,
          location: dialogData.meetingDetails.location
        });
      } else {
        this.meetingForm.patchValue({ date: new Date() });
      }

      const t1 = gsap.timeline({});
      t1.to('#create-meeting', { scale: 1, duration: 0.3, ease: 'power2' })
        .to('#meeting-content', { opacity: 1, duration: 0.05, ease: 'power2' }, '-=0.2');
    });
  }

  get meetingFormControl() {
    return this.meetingForm.controls;
  }

  closeDialog() {
    const t1 = gsap.timeline({});
    t1.to('#meeting-content', { opacity: 0.2, duration: 0.2, ease: 'power2' })
      .to('#create-meeting', { scale: 0, duration: 0.3, ease: 'power2' }, '-=0.2');
    this.isSubmitted = false;
    this.meetingDetails = null;
  }

  createOrUpdate() {
    if (this.editMode) {
      this.updateMeeting();
    } else {
      this.createMeeting();
    }
  }

  updateMeeting() {
    this.isSubmitted = true;

    if (this.meetingForm.invalid) {
      return;
    }

    const meeting: Meeting = {
      id: this.meetingDetails.id,
      title: this.meetingForm.value.title,
      date: new Date(this.meetingForm.value.date),
      startTime: this.getMeetingStartTime(),
      endTime: this.getMeetingEndTime(),
      location: this.meetingForm.value.location,
      creator: '',
      assignedTo: ''
    };

    this.meetingCreationProgress = true;
    this.meetingService.updateMeetingDetails(meeting).subscribe(response => {
      this.closeDialog();
      this.meetingCreationProgress = false;
      this.meetingNotifier.meetingCreated.next();
      this.socketService.notifyMeeting(`Meeting Updated - ${meeting.title}`, this.calendarUserID);
    }, error => {
      this.meetingCreationProgress = false;
      console.log(error);
    });
  }

  createMeeting() {
    this.isSubmitted = true;

    if (this.meetingForm.invalid) {
      return;
    }

    const meeting: Meeting = {
      id: '',
      title: this.meetingForm.value.title,
      date: new Date(this.meetingForm.value.date),
      startTime: this.getMeetingStartTime(),
      endTime: this.getMeetingEndTime(),
      location: this.meetingForm.value.location,
      creator: '',
      assignedTo: this.calendarUserID
    };

    this.meetingCreationProgress = true;
    this.meetingService.createMeeting(meeting).subscribe(response => {
      this.closeDialog();
      this.meetingCreationProgress = false;
      this.meetingNotifier.meetingCreated.next();
      this.socketService.notifyMeeting(`New Meeting created - ${meeting.title}`, this.calendarUserID);
    }, error => {
      this.meetingCreationProgress = false;
      console.log(error);
    });
  }

  getMeetingStartTime(): Date {
    const date = this.meetingForm.value.date;
    const startTime = this.meetingForm.value.startTime;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTime.getHours(), startTime.getMinutes(), 0);
  }

  getMeetingEndTime(): Date {
    const date = this.meetingForm.value.date;
    const endTime = this.meetingForm.value.endTime;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime.getHours(), endTime.getMinutes(), 0);
  }

  onStartValidationFailed() {
    const errorMessage = 'Invalid meeting start time';
    this.notificationService.showErrorNotification(errorMessage);
  }

  onEndValidationFailed() {
    const errorMessage = 'Invalid meeting end time';
    this.notificationService.showErrorNotification(errorMessage);
  }

  onStartTimeChanged(event: IgxTimePickerValueChangedEventArgs) {
    this.startTime = this.startTimePicker.displayTime;
  }

  onEndTimeChanged(event: IgxTimePickerValueChangedEventArgs) {
    this.endTime = this.endTimePicker.displayTime;
  }

  getMeetingTitle() {
    return this.editMode ? 'Meeting Details' : 'Create Meeting';
  }

  doNothing() {
    // do nothing as not an admin
  }
}
