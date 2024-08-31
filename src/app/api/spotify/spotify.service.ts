import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private client_id = '63e107aee6b549d980b4075dcd9a93f2';
  private client_secret = '6a0b6804cd0448c8ad35fb1da92925e3';
  private redirect_uri = 'tfm_app'; //'https://tfm-app-dsl.firebaseapp.com/__/auth/handler'; 

  private access_token: string | null = null;
  private refresh_token: string | null = null;

  private readonly AUTHORIZE = 'https://accounts.spotify.com/authorize';
  private readonly TOKEN = 'https://accounts.spotify.com/api/token';
  private readonly USER_PROFILE = 'https://api.spotify.com/v1/me';

  constructor(private http: HttpClient) {}

  async requestAuthorization(): Promise<void> {
    const scopes = 'user-read-private user-read-email user-modify-playback-state user-library-read streaming user-read-recently-played playlist-read-private';
    const url = `${this.AUTHORIZE}?client_id=${this.client_id}&response_type=code&redirect_uri=${encodeURIComponent(this.redirect_uri)}&scope=${encodeURIComponent(scopes)}`;
    
    // Open the authorization URL in the Capacitor Browser
    await Browser.open({ url });
  }

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
        console.log(code)
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
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(this.redirect_uri)}&client_id=${this.client_id}&client_secret=${this.client_secret}`;
    
    return this.callAuthorizationApi(body);
  }

  private callAuthorizationApi(body: string): Promise<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${this.client_id}:${this.client_secret}`)
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
    if (response.access_token) {
      this.access_token = response.access_token;
      localStorage.setItem('access_token', response.access_token);
    }
  }

  // Fetch user profile info
  getSpotifyUser() {
    this.access_token = localStorage.getItem('access_token');  

    if (!this.access_token) {
      console.error("No access token available");
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.access_token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.USER_PROFILE, { headers });
  }
}
