import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeetingNotifierService {
  openDialog = new Subject<{
    userID: string,
    editMode: boolean,
    isAdmin: boolean,
    meetingDetails: any
  }>();
  meetingCreated = new Subject<null>();

  constructor() { }
}
