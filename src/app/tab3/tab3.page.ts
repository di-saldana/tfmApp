import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { SpotifyService } from '../api/spotify/spotify.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page { 
  userName: string = 'Dianelys';
  userAge: number = 25;
  userDistance: number = 0; 
  favoriteArtists: string[] = ['Lorde', 'Declan McKenna', 'Hozier'];
  favoriteSongs: string[] = ['Unknown / Nth', 'Team', 'The Key to Life on Earth'];
  favoriteAlbums: string[] = ['Melodrama', 'Unreal Unearth', 'Zeros', 'YHLQMDLG'];
  favoriteGenres: string[] = ['Indie pop', 'Alternative', 'Latin rock'];
  events: string[] = [];
  artistImages: string[] = []; 
  userId: string = '';  
  users_interested: string[] = [];

  constructor(
    private router: Router, 
    public spotifyService: SpotifyService
  ) {}

  async ngOnInit() {
    const user = this.utilsService.getFromLocalStorage('user'); 
    if (user && user.uid) {
      this.userId = user.uid;
      this.userName = user.name;
      this.userAge = user.age;
      this.loadSavedEvents(user.uid);
    } else {
      console.error('User ID is not available');
      this.router.navigate(['/auth']);
    }

    // this.loadArtistImages();
  }

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  // goToPossibleMatches() {
  //   this.router.navigate(['/tabs/possible-matches']);
  // }

  goToPossibleMatches(selectedEvent: string) {
    this.router.navigate(['/tabs/possible-matches'], { queryParams: { event: selectedEvent } });
  }
  
  signOut() {
    this.firebaseService.signout();
  }

  async loadArtistImages() {
    for (let artist of this.favoriteArtists) {
      try {
        const response = await this.spotifyService.getSpotifyArtist(artist);
        const artistData = response.artists.items[0];
        const imageUrl = artistData?.images[0]?.url || 'https://ionicframework.com/docs/img/demos/avatar.svg'; // Default if no image
        this.artistImages.push(imageUrl);
      } catch (error) {
        console.error('Error fetching artist data: ', error);
        this.artistImages.push('https://ionicframework.com/docs/img/demos/avatar.svg'); // Default image if error occurs
      }
    }
  }
  
  // Method to load saved events
  loadSavedEvents(userId: string) {
    this.firebaseService.getSavedEvents(userId).subscribe(
      events => {
        this.events = events;
        console.log('Saved Events:', this.events);
      },
      error => {
        console.error('Error loading saved events:', error);
      }
    );
  }
}
