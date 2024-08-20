import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  profiles = [
    {
      name: 'Match 1',
      image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      location: 'New York',
      events: ['Event 1', 'Event 2']
      // Mostrar todos sus eventos pero solo resaltar (con otro color) los eventos en los cuales ambos matchearon
    },
    {
      name: 'Match 2',
      image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      location: 'Los Angeles',
      events: ['Event 1', 'Event 2', 'Event 3']
    }
  ];

  constructor() {}
}
