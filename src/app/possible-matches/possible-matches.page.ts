import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-possible-matches',
  templateUrl: './possible-matches.page.html',
  styleUrls: ['./possible-matches.page.scss'],
})
export class PossibleMatchesPage implements OnInit {

  profiles = [
    {
      name: 'Sara',
      age: '20',
      image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      location: 'New York',
      events: ['Event 1', 'Event 2'],
      artists: ['Phoebe Bridgers', 'Arlo Parks']
      // Mostrar todos sus eventos pero solo resaltar (con otro color) los eventos en los cuales ambos matchearon
    },
    {
      name: 'Miguel',
      age: '30',
      image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      location: 'España',
      events: ['Event 1', 'Event 2', 'Event 3'],
      artists: ['Young the Giant', 'Izal']
    }
  ];

  constructor() { }

  ngOnInit() {
  }
}
