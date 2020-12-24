import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlannerComponent } from './planner/planner.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';

import {
  IgxCalendarModule,
  IgxDatePickerModule,
  IgxIconModule,
  IgxInputGroupModule,
  IgxTimePickerModule
} from 'igniteui-angular';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CreateMeetingComponent } from './create-meeting/create-meeting.component';
import { DashboardGuard } from './dashboard/dashboard.guard';

const routes: Routes = [{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [DashboardGuard]
},
{
  path: 'calendar/:id',
  component: PlannerComponent
}
];

@NgModule({
  declarations: [DashboardComponent, PlannerComponent, HeaderComponent, CreateMeetingComponent],
  imports: [
    CommonModule,
    SharedModule,
    IgxCalendarModule,
    IgxDatePickerModule,
    IgxIconModule,
    IgxInputGroupModule,
    IgxTimePickerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: [DashboardGuard]
})
export class PlannerModule { }
