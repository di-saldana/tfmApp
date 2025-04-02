import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { SpotifyService } from '../api/spotify/spotify.service';
import { HttpClient } from '@angular/common/http';
import { LocationService } from '../services/location/location.service';

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
  favoriteSongs: any[] = []   // ['Unknown / Nth', 'Team', 'The Key to Life on Earth'];
  favoriteAlbums: any[] = []  // ['Melodrama', 'Unreal Unearth', 'Zeros', 'YHLQMDLG'];
  favoriteGenres: any[] = []  // ['Indie pop', 'Alternative', 'Latin rock'];
  events: any[] = [];
  artistImages: any[] = []; 
  userId: string = '';  
  users_interested: any[] = [];
  profileImage: string = 'https://ionicframework.com/docs/img/demos/avatar.svg'; // Default image
  userFlag: string;

  constructor(
    private router: Router, 
    public spotifyService: SpotifyService,
    private http: HttpClient,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    const user = this.utilsService.getFromLocalStorage('user');
    const firebaseProfile = this.firebaseService.getUserProfile(user.uid);

    this.loadTopAlbums();

    if (user && user.uid) {
      this.userId = user.uid;
      this.userName = user.name;
      this.userAge = user.age; 
      this.loadSavedEvents(user.uid);
      this.loadTopAlbumsForUser((await firebaseProfile).last_fm_id);
      this.getUserFlag();
      await this.loadTopArtists(); 
      await this.loadTopTracks();

      // TODO: Call loadUserProfile if a Spotify account user id exists, if not, call loadProfilePic
      // await this.loadUserProfile();
      // await this.loadProfilePic(user.uid);

      // Check if the user has a Spotify account linked
      if (user.spotifyUserId) {
        // If the Spotify account is linked, load the Spotify user profile
        await this.loadUserProfile();
      } else {
        // Otherwise, load the profile picture from Firebase
        // await this.loadProfilePic(user.uid);
      }
    } else {
      console.error('User ID is not available');
      this.router.navigate(['/auth']);
    }
  }

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  // Passes the event as an argument to possible-matches
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
      const loading = await this.utilsService.loading();
      await loading.present();

      const userProfile = await this.spotifyService.getUserProfile();
      if (userProfile) {
        this.profileImage = userProfile.images?.[1]?.url || 'https://ionicframework.com/docs/img/demos/avatar.svg'; // Default image
        this.userName = userProfile.display_name || this.userName;
      }

      await loading.dismiss();
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async loadProfilePic(userId: string) {
    const loading = await this.utilsService.loading();
    await loading.present();
    this.firebaseService.getProfilePicture(userId).subscribe(
      pic => {
        this.profileImage = pic;
        console.log('Picture: ', this.profileImage);
        loading.dismiss();
      },
      error => {
        console.error('Error loading saved events:', error);
      }
    );
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

  async loadTopAlbums() {
    const apiUrl = 'https://ws.audioscrobbler.com/2.0/';
    const apiKey = '6b949ae3e54e839ec00f53bf82c6a120';  // Last.fm API key
  
    try {
      // Retrieve the user object from local storage or Firebase
      const user = this.utilsService.getFromLocalStorage('user');
      
      // Fetch last_fm_id from Firebase
      const userProfile = await this.firebaseService.getUserProfile(user.uid);
      const lastFmId = userProfile.last_fm_id;
  
      if (!lastFmId) {
        console.error('No Last.fm ID found for user');
        return;
      }
  
      const params = {
        method: 'user.getTopAlbums',
        user: lastFmId,
        limit: '4',
        api_key: apiKey,
        format: 'json'
      };
  
      // Fetch the top albums from Last.fm API
      const response: any = await this.http.get(apiUrl, { params }).toPromise();
      this.favoriteAlbums = response.topalbums.album.map((album: any) => ({
        name: album.name,
        image: album.image.find((img: any) => img.size === 'large')?.['#text'] || 'https://ionicframework.com/docs/img/demos/card-media.png'
      }));
      
    } catch (error) {
      console.error('Error fetching top albums: ', error);
    }
  }  

  async loadTopAlbumsForUser(userId: string): Promise<any[]> {
    console.log("Last fm id: ", userId);
    const apiUrl = 'https://ws.audioscrobbler.com/2.0/';
    const apiKey = '6b949ae3e54e839ec00f53bf82c6a120';  // Last.fm API key
    
    try {
      // Fetch user profile from Firebase
      const userProfile = await this.firebaseService.getUserProfile(userId);
      const lastFmId = userProfile.last_fm_id;

      if (!lastFmId) {
        console.error('No Last.fm ID found for user:', userId);
        return [];
      }

      const params = {
        method: 'user.getTopAlbums',
        user: lastFmId,
        limit: '4',
        api_key: apiKey,
        format: 'json'
      };

      // Fetch the top albums from Last.fm API
      const response: any = await this.http.get(apiUrl, { params }).toPromise();
      
      return response.topalbums.album.map((album: any) => ({
        name: album.name,
        image: album.image.find((img: any) => img.size === 'large')?.['#text'] || 'https://ionicframework.com/docs/img/demos/card-media.png'
      }));

    } catch (error) {
      console.error('Error fetching top albums for user:', userId, error);
      return [];
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

  async getUserFlag() {
    try {
      this.userFlag = await this.locationService.getUserCountryFlag(this.userId);
    } catch (error) {
      console.error('Error getting user flag:', error);
    }
  }

}