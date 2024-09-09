import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { SpotifyService } from '../api/spotify/spotify.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page { 
  userName: string = 'Name';
  userAge: number = 25;
  userDistance: number = 0; 
  favoriteArtists: any[] = [] // ['Lorde', 'Declan McKenna', 'Hozier'];
  favoriteSongs: any[] = [] // ['Unknown / Nth', 'Team', 'The Key to Life on Earth'];
  favoriteAlbums: any[] = [] // ['Melodrama', 'Unreal Unearth', 'Zeros', 'YHLQMDLG'];
  favoriteGenres: any[] = [] // ['Indie pop', 'Alternative', 'Latin rock'];
  events: any[] = [];
  artistImages: any[] = []; 
  userId: string = '';  
  users_interested: any[] = [];
  profileImage: string = 'https://ionicframework.com/docs/img/demos/avatar.svg'; // Default image

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
      await this.loadUserProfile();
      this.loadSavedEvents(user.uid);
      this.loadTopAlbums();
      await this.loadTopArtists(); 
      await this.loadTopTracks();
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

  async loadArtistImages() {
    for (let artist of this.favoriteArtists) {
      try {
        // const response = await this.spotifyService.getSpotifyArtist(artist);
        // const artistData = response.artists.items[0];
        const imageUrl = 'https://ionicframework.com/docs/img/demos/avatar.svg'; // Default if no image // artistData?.images[0]?.url || 
        this.artistImages.push(imageUrl);
      } catch (error) {
        console.error('Error fetching artist data: ', error);
        this.artistImages.push('https://ionicframework.com/docs/img/demos/avatar.svg'); // Default image if error occurs
      }
    }
  }

  // Load user profile from Spotify
  async loadUserProfile() {
    try {
      const userProfile = await this.spotifyService.getUserProfile();
      if (userProfile) {
        this.profileImage = userProfile.images?.[1]?.url || 'https://ionicframework.com/docs/img/demos/avatar.svg'; // Default image
        this.userName = userProfile.display_name || this.userName;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
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

  // Last.fm
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

  // Load user's top artists from Spotify
  async loadTopArtists() {
    try {
      const topArtists = await this.spotifyService.getTopArtists(4);
      if (topArtists) {
        this.favoriteArtists = topArtists.map((artist: any) => ({
          name: artist.name,
          image: artist.images?.[0]?.url || 'https://ionicframework.com/docs/img/demos/avatar.svg', // Default image
          genres: artist.genres
        }));
        console.log('Favorite Artists:', this.favoriteArtists);
      }
    } catch (error) {
      console.error('Error loading top artists:', error);
    }
  }

  // Load user's top tracks from Spotify
  async loadTopTracks() {
    try {
      const topTracks = await this.spotifyService.getTopTracks(10); 
      if (topTracks) {
        this.favoriteSongs = topTracks.map((track: any) => ({
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown Artist',
          album: track.album.name,
          image: track.album.images?.[0]?.url || 'https://ionicframework.com/docs/img/demos/card-media.png' // Default image
        }));
        console.log('Favorite Tracks:', this.favoriteSongs);
      }
    } catch (error) {
      console.error('Error loading top tracks:', error);
    }
  }

}
