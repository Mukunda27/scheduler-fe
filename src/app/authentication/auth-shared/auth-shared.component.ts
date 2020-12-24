import { Component, OnInit } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-auth-shared',
  templateUrl: './auth-shared.component.html',
  styleUrls: ['./auth-shared.component.scss']
})
export class AuthSharedComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    const t1 = gsap.timeline({
      delay: 3,
      repeat: -1,
      repeatDelay: 3
    });
    t1.to('.outer-container', { duration: 0.4, xPercent: -100, ease: 'power2' })
      .from('.shape', { duration: 0.3, opacity: 0.2, scale: 0.3, ease: 'bounce' }, '-=0.1')
      .to('.outer-container', { duration: 0.4, xPercent: -200, ease: 'power2' }, '+=3')
      .from('.shape1', { duration: 0.3, opacity: 0.2, scale: 0.3, ease: 'bounce' }, '-=0.1')
      .set('.outer-container', { x: 0 });
  }

}
