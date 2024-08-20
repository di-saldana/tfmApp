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
      image: 'https://ionicframework.com/docs/img/demos/card-media.png',
      location: 'New York',
      events: ['Concert 1', 'Concert 2', 'Concert 3']
    },
    {
      name: 'Match 2',
      image: 'https://ionicframework.com/docs/img/demos/card-media.png',
      location: 'Los Angeles',
      events: ['Concert 1', 'Concert 2', 'Concert 3']
    }
  ];

  constructor() {}
}
