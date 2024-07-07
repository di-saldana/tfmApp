import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  userName: string = 'Dianelys Saldaña';
  userAge: number = 25;
  userDistance: number = 0; 
  favoriteArtists: string[] = ['Lorde', 'Declan McKenna', 'Hozier'];
  favoriteSongs: string[] = ['Unknown / Nth', 'The Key to Life on Earth', 'Team'];
  favoriteGenres: string[] = ['Indie pop', 'Alternative', 'Latin rock'];

  constructor() {}

  ngOnInit() {
    // Initialize or fetch user data here
  }

}
