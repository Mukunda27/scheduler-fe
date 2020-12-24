import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { Meeting } from './meeting';
import { map } from 'rxjs/operators';
import { User } from './user.model';

import startOfDay from 'date-fns/startOfDay';

const BACKEND_URL = environment.apiUrl + 'meeting/';


@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(
    private httpClient: HttpClient
  ) { }

  createMeeting(meeting: Meeting) {
    const httpBody = {
      title: meeting.title, date: meeting.date, startTime: meeting.startTime,
      endTime: meeting.endTime, location: meeting.location, assignedTo: meeting.assignedTo
    };

    return this.httpClient.post<{ message: string, meeting: any }>(BACKEND_URL + 'create', httpBody);
  }

  getAllNonAdminUsers() {
    return this.httpClient.get<{ users: any[] }>(BACKEND_URL + 'all-nonadmin-users').pipe(
      map(response => {
        return {
          users: response.users.map(user => {
            const transformedUser: User = {
              userID: user._id,
              name: user.name,
              email: user.email,
              admin: user.admin
            };
            return transformedUser;
          })
        };
      })
    ).toPromise();
  }

  getAllMeetings(userID: string, day: Date) {
    const year = day.getFullYear();
    const month = day.getMonth() + 1;
    const date = day.getDate();
    const offset = day.getTimezoneOffset();

    const queryParams = `?userID=${userID}&year=${year}&month=${month}&date=${date}&offset=${offset}`;
    return this.httpClient.get<{ meetings: any[] }>(BACKEND_URL + 'all-meetings' + queryParams).pipe(
      map(response => {
        return {
          meetings: response.meetings.map(meeting => {
            const transformedMeeting: Meeting = {
              id: meeting._id,
              title: meeting.title,
              date: startOfDay(new Date(meeting.date)),
              startTime: new Date(meeting.startTime),
              endTime: new Date(meeting.endTime),
              location: meeting.location,
              creator: meeting.creator[0].name,
              assignedTo: meeting.assignedTo[0].name
            };
            return transformedMeeting;
          })
        };
      })
    ).toPromise();
  }

  updateMeetingDetails(meeting: Meeting) {
    const httpBody = {
      title: meeting.title, date: meeting.date, startTime: meeting.startTime,
      endTime: meeting.endTime, location: meeting.location
    };
    return this.httpClient.put(BACKEND_URL + meeting.id, httpBody);
  }

  deleteMeeting(meetingID: string) {
    return this.httpClient.delete(BACKEND_URL + meetingID);
  }
}
