import { Component, OnInit } from '@angular/core';
import { faChevronRight, faGlobe, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  faChevronRight = faChevronRight;
  faCalendarAlt = faCalendarAlt;
  faGlobe = faGlobe;
  faUsers = faUsers;

  constructor() { }

  ngOnInit(): void {
  }

}
