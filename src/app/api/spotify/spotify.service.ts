import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpotifyUser } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';

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
  private readonly REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  constructor(private http: HttpClient, private firebase: FirebaseService) {
    this.setupTokenRefresh();
  }

  async requestAuthorization(): Promise<void> {
    const scopes = 'user-read-private user-read-email user-modify-playback-state user-library-read streaming user-read-recently-played playlist-read-private user-top-read';
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

      // Once the access token is retrieved, handle rest of the flow
      this.handleSpotifyLogin()

      const expiresIn = response['expires_in'];
      const expirationTime = new Date().getTime() + (expiresIn * 1000); // Convert to milliseconds
      localStorage.setItem('token_expiration', expirationTime.toString());

      this.refresh_token = response['refresh_token'];
      localStorage.setItem('refresh_token', this.refresh_token);

      return response;  
    } catch (error) {
      console.error('Error getting access token: ', error);
      throw error;
    }
  }

  // Refresh token logic
  async refreshAccessToken(): Promise<void> {
    const base64Credentials = btoa(`${this.client_id}:${this.client_secret}`);
  
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refresh_token || ''
    });
  
    try {
      const response = await this.http.post(this.TOKEN, body.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64Credentials}`
        })
      }).toPromise();
  
      this.access_token = response['access_token'];
      localStorage.setItem('access_token', this.access_token);
      console.log('Access Token Refreshed:', this.access_token);
    } catch (error) {
      console.error('Error refreshing access token: ', error);
    }
  }  

  async getRefreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    const url = this.TOKEN; 
  
    if (!refreshToken) {
      console.error('Refresh token not found');
      return;
    }
  
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.client_id}:${this.client_secret}`)}`, // Spotify requires basic auth with client_id:client_secret
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    };
  
    try {
      const response = await fetch(url, payload);
      const data = await response.json();
  
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        console.log('New access token:', data.access_token);
  
        // Optionally, check if Spotify provides a new refresh token and store it
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
          console.log('New refresh token:', data.refresh_token);
        }
  
        // Update the token expiration time (assume expires_in is provided in seconds)
        const expirationTime = new Date().getTime() + (data.expires_in * 1000);
        localStorage.setItem('token_expiration', expirationTime.toString());
      } else {
        console.error('Error fetching refresh token: ', data);
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
    }
  }  

  private setupTokenRefresh(): void {
    setInterval(() => {
      this.refreshAccessToken().catch(error => console.error('Token refresh failed', error));
    }, this.REFRESH_INTERVAL_MS);
  }

  private async ensureTokenValid(): Promise<void> {
    if (this.isTokenExpired()) {
      console.log('Token expired, refreshing...');
      await this.getRefreshToken();
    } else {
      console.log('Token is still valid.');
    }
  }

  private isTokenExpired(): boolean {
    const expirationTime = localStorage.getItem('token_expiration');
    if (!expirationTime) {
      return true; // If expiration time is not found, consider the token as expired
    }
  
    const currentTime = new Date().getTime();
    return currentTime > parseInt(expirationTime, 10);
  }  

  async handleSpotifyLogin() {
    console.log("Handle Spotify Login Flow")
    /*
    TODO: Flow for when a user authenticates with Spotify:

      - Retrieve email from profile info with spotify.getProfile() method
      - Check if email is registered already:
        - If it is registered:
          - Retrieve Spotify ID from profile
          - updateUser() with the spotify id
          - navigate home ('tabs/tab1')
        - If user is not registered
          - authenticateWithSpotify()
          - navigate home ('tabs/tab1')
    */
    const email = (await this.getProfile()).email
    const emailExists = await this.firebase.checkIfEmailExists(email);
    console.log("Email exists: ", emailExists, email)

    if(emailExists) {
      // TODO: NOT WORKING
      // this.firebase.signinWithSpotify(email);
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      // Create a new user account
      this.firebase.authenticateWithSpotify(email)
    }
  }

  // Shows profile info
  async getProfile(): Promise<SpotifyUser | null> {
    await this.ensureTokenValid(); 

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

  // Data Requests
  // Method to get user profile
  async getUserProfile(): Promise<any> {
    const url = this.USER_PROFILE; // Spotify API endpoint for user profile
    const accessToken = localStorage.getItem('access_token');
    await this.ensureTokenValid(); 

    if (!accessToken) {
      console.error('Access token not found');
      return null;
    }

    try {
      const response = await this.http.get(url, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      }).toPromise();
      console.log('User Profile Response:', response); // Log the response
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Retrieves user's top artists
  async getTopArtists(limit: number = 4): Promise<any> {
    this.access_token = localStorage.getItem('access_token');
    await this.ensureTokenValid(); 

    if (!this.access_token) {
      console.error('Access token not found');
      return null;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=${limit}`, {
        headers: {
          Authorization: 'Bearer ' + this.access_token
        }
      });

      const data = await response.json();
      console.log('Top Artists:', data.items); // Log top artists

      return data.items;  // Return top artists
    } catch (error) {
      console.error('Error fetching top artists: ', error);
      return null;
    }
  }

  // Retrieves user's top tracks
  async getTopTracks(limit: number = 10): Promise<any> {
    this.access_token = localStorage.getItem('access_token');
    await this.ensureTokenValid(); 

    if (!this.access_token) {
      console.error('Access token not found');
      return null;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, { 
        headers: {
          Authorization: 'Bearer ' + this.access_token
        }
      });

      const data = await response.json();
      console.log('Top Tracks:', data.items); // Log top tracks

      return data.items;  // Return top tracks
    } catch (error) {
      console.error('Error fetching top tracks: ', error);
      return null;
    }
  }

  ///
  onPageLoad(): void {
    this.client_id = this.client_id; // localStorage.getItem('client_id') || '';
    this.client_secret = this.client_secret; // localStorage.getItem('client_secret') || '';
    const queryString = window.location.search;
    if (queryString.length > 0) {
      this.handleRedirect(this.redirect_uri);
    } else {
      this.access_token = localStorage.getItem('access_token');
      if (this.access_token === null) {
        document.getElementById('tokenSection'); 
      } else {
        document.getElementById('deviceSection');
      }
    }
  }

  async handleRedirect(url: string): Promise<void> {
    // Check if the URL contains the authorization code
    if (url.startsWith(this.redirect_uri)) {
      // const code = new URL(url).searchParams.get('code');
      const code = this.getCode();
      if (code) {
        console.log("CODE:", code)
        // Exchange the authorization code for access and refresh tokens
        await this.fetchAccessToken(code);
      }
    }
  }

  private getCode(): string | null {
    const queryString = window.location.search;
    if (queryString.length > 0) {
      const urlParams = new URLSearchParams(queryString);
      return urlParams.get('code');
    }
    return null;
  }

  private fetchAccessToken(code: string): Promise<void> {
    // const body = `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(this.redirect_uri)}`;
    const body = `grant_type=client_credentials&redirect_uri=${encodeURIComponent(this.redirect_uri)}`;
    
    return this.callAuthorizationApi(body);
  }

  private callAuthorizationApi(body: string): Promise<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${this.client_id}:${this.client_secret}`)
    });

    return new Promise((resolve, reject) => {
      this.http.post(this.TOKEN, body, { headers }).subscribe({
        next: (response: any) => {
          this.handleAuthorizationResponse(response);
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  private handleAuthorizationResponse(response: any): void {
    alert("before")
    if (response.access_token) {
      this.access_token = response.access_token;
      localStorage.setItem('access_token', response.access_token);
    }
  }

}