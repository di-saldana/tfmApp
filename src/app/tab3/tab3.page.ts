import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { SpotifyService } from '../api/spotify/spotify.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page { 
  userName: string = 'Dianelys';
  userAge: number = 25;
  userDistance: number = 0; 
  favoriteArtists: any[] = []; 
  favoriteSongs: string[] = ['Unknown / Nth', 'Team', 'The Key to Life on Earth'];
  favoriteAlbums: any[] = []; 
  favoriteGenres: string[] = ['Indie pop', 'Alternative', 'Latin rock'];
  events: string[] = [];
  artistImages: string[] = []; 
  userId: string = '';  
  users_interested: string[] = [];

  constructor(
    private router: Router, 
    public spotifyService: SpotifyService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    const user = this.utilsService.getFromLocalStorage('user'); 
    if (user && user.uid) {
      this.userId = user.uid;
      this.userName = user.name;
      this.userAge = user.age;
      this.loadSavedEvents(user.uid);
      this.loadTopArtists();
      this.loadTopAlbums();
    } else {
      console.error('User ID is not available');
      this.router.navigate(['/auth']);
    }
  }

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  goToPossibleMatches(selectedEvent: string) {
    this.router.navigate(['/tabs/possible-matches'], { queryParams: { event: selectedEvent } });
  }
  
  signOut() {
    this.firebaseService.signout();
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

  // Method to retrieve and load top albums
  async loadTopAlbums() {
    const apiUrl = 'https://ws.audioscrobbler.com/2.0/';
    const params = {
      method: 'user.getTopAlbums',
      user: 'dianelyssaldana',
      limit: '4',
      api_key: '6b949ae3e54e839ec00f53bf82c6a120',
      format: 'json'
    };

    try {
      const response: any = await this.http.get(apiUrl, { params }).toPromise();
      this.favoriteAlbums = response.topalbums.album.map((album: any) => ({
        name: album.name,
        image: album.image.find((img: any) => img.size === 'large')?.['#text'] || 'https://ionicframework.com/docs/img/demos/card-media.png'
      }));
    } catch (error) {
      console.error('Error fetching top albums: ', error);
    }
  }

  // Method to retrieve and load top artists
  async loadTopArtists() {
    const apiUrl = 'https://ws.audioscrobbler.com/2.0/';
    const params = {
      method: 'user.getTopArtists',
      user: 'dianelyssaldana', // TODO: Replace with dynamic user 
      limit: '4', // Fetch top artists
      api_key: '6b949ae3e54e839ec00f53bf82c6a120', 
      format: 'json'
    };

    try {
      // Fetch top artists from the Last.fm API
      const response: any = await this.http.get(apiUrl, { params }).toPromise();

      // Process the response and map artist data
      this.favoriteArtists = response.topartists.artist.map((artist: any) => ({
        name: artist.name,
        image: artist.image.find((img: any) => img.size === 'extralarge')?.['#text'] || 'https://ionicframework.com/docs/img/demos/card-media.png'
      }));
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  }
}
