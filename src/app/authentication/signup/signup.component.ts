import { Component, OnInit } from '@angular/core';
import { faUnlockAlt, faPhone, faUser, faEnvelopeOpen, faUserCog } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
import { UserService } from '../../user.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss', '../auth-common.scss']
})
export class SignupComponent implements OnInit {
  faEnvelopeOpen = faEnvelopeOpen;
  faUnlockAlt = faUnlockAlt;
  faPhone = faPhone;
  faUser = faUser;
  faUserCog = faUserCog;

  isLoading = false;

  // phone input config params
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.India];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.userCreationFailed.subscribe(() => {
      console.log('creation failed');
      this.isLoading = false;
    });
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }

    let adminRole: boolean;
    if (!form.value.adminRole) {
      adminRole = false;
    } else {
      adminRole = form.value.adminRole;
    }

    this.isLoading = true;
    this.userService.createUser(form.value.name, form.value.phone.e164Number,
      form.value.email, form.value.password, adminRole);
  }

}
