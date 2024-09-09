import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpotifyUser } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private client_id = '63e107aee6b549d980b4075dcd9a93f2';
  private client_secret = '6a0b6804cd0448c8ad35fb1da92925e3';
  private redirect_uri = 'capacitor://localhost/auth' // 'http://localhost:8100/auth' // 'http://localhost:8100/tabs/tab1/' 

  private access_token: string | null = null;
  private refresh_token: string | null = null;

  private readonly AUTHORIZE = 'https://accounts.spotify.com/authorize';
  private readonly TOKEN = 'https://accounts.spotify.com/api/token';
  private readonly USER_PROFILE = 'https://api.spotify.com/v1/me';

  constructor(private http: HttpClient) {}

  async requestAuthorization(): Promise<void> {
    const scopes = 'user-read-private user-read-email user-modify-playback-state user-library-read streaming user-read-recently-played playlist-read-private';
    const url = `${this.AUTHORIZE}?client_id=${this.client_id}&response_type=code&redirect_uri=${encodeURIComponent(this.redirect_uri)}&scope=${encodeURIComponent(scopes)}`;
    
    window.open(url)

    window.addEventListener('message', event => {
      const hash = JSON.parse(event.data);
      console.log(hash)
      if (hash.type == 'access_token') {
      }
    }, false);
  }

  // Method to exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<any> {
    const base64Credentials = btoa(`${this.client_id}:${this.client_secret}`);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirect_uri,
      // client_id: this.client_id,
      // client_secret: this.client_secret,
    });

    try {
      const response = await this.http.post(this.TOKEN, body.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64Credentials}`  
        }),
      }).toPromise();

      localStorage.setItem('access_token', response['access_token']);
      this.access_token = localStorage.getItem('access_token');
      console.log('Local Access Token:', this.access_token);

      localStorage.setItem('refresh_token', response['refresh_token']);
      this.refresh_token = localStorage.getItem('refresh_token');
      console.log('Local Refresh Token:', this.refresh_token);

      return response;  
    } catch (error) {
      console.error('Error getting access token: ', error);
      throw error;
    }
  }

  // Shows profile info
  async getProfile(): Promise<SpotifyUser | null> {
    this.access_token = localStorage.getItem('access_token');
    if (!this.access_token) {
      console.error('Access token not found');
      return null;
    }
  
    try {
      const response = await fetch(this.USER_PROFILE, {
        headers: {
          Authorization: 'Bearer ' + this.access_token
        }
      });
  
      const data = await response.json();
      
      // Extract specific fields
      const userProfile: SpotifyUser = {
        displayName: data.display_name,
        email: data.email,
        spotifyID: data.id,
        country: data.country,
        profileImage: data.images?.[0]?.url || null, // Handle optional image
        followersCount: data.followers?.total || 0
      };
    
      // Log extracted data
      console.log('User Profile:', userProfile);
    
      return userProfile;  // Return user profile data
    } catch (error) {
      console.error('Error fetching profile data: ', error);
      return null;
    }
  }  

}