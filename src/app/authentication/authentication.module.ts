import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { AuthSharedComponent } from './auth-shared/auth-shared.component';
import { NewPasswordGuard } from './new-password/new-password.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthSharedComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path: 'password-reset',
        component: PasswordResetComponent
      },
      {
        path: 'new-password/:token',
        component: NewPasswordComponent,
        canActivate: [NewPasswordGuard]
      }
    ]
  }
];

@NgModule({
  declarations: [LoginComponent, SignupComponent, PasswordResetComponent, NewPasswordComponent, AuthSharedComponent],
  imports: [
    SharedModule,
    NgxIntlTelInputModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: [NewPasswordGuard]
})
export class AuthenticationModule { }
