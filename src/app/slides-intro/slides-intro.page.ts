import { Component, OnInit, AfterViewInit, inject } from '@angular/core';

// Swiper
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-slides-intro',
  templateUrl: './slides-intro.page.html',
  styleUrls: ['./slides-intro.page.scss'],
})
export class SlidesIntroPage implements OnInit {

  constructor() {}

  ngOnInit() {}

}