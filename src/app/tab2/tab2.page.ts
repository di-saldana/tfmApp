import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  profiles = [
    {
      name: 'Sara',
      age: '20',
      image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      location: 'New York',
      events: ['Event 1'],
      artists: ['Phoebe Bridgers', 'Arlo Parks']
      // Mostrar todos sus eventos pero solo resaltar (con otro color) los eventos en los cuales ambos matchearon
    },
    {
      name: 'Miguel',
      age: '30',
      image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      location: 'Spain',
      events: ['Event 3'],
      artists: ['Young the Giant', 'Izal']
    }
  ];

  constructor(private router: Router) {}

  goToChat(profile: any) {
    this.router.navigate(['/chat'], { queryParams: { profileId: profile.id, profileName: profile.name } });
  }

  goToProfile(profile: any) {
    this.router.navigate(['/tabs/tab3'], { queryParams: { profileId: profile.id, profileName: profile.name } });
  }
}
