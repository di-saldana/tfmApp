import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
      location: 'Spain',
      events: ['Event 1', 'Event 2', 'Event 3'],
      artists: ['Young the Giant', 'Izal']
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
  }

  goToProfile(profile: any) {
    this.router.navigate(['/tabs/tab3'], { queryParams: { profileId: profile.id, profileName: profile.name } });
  }
}
