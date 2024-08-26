import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private client_id = '63e107aee6b549d980b4075dcd9a93f2';
  private client_secret = '6a0b6804cd0448c8ad35fb1da92925e3';
  private redirect_uri = 'https://us-central1-tfm-app-dsl.cloudfunctions.net/callback'; // 'http://localhost:8100/tabs/tab1'; 

  private access_token: string | null = null;
  private refresh_token: string | null = null;

  private readonly AUTHORIZE = 'https://accounts.spotify.com/authorize';
  private readonly TOKEN = 'https://accounts.spotify.com/api/token';
  private readonly PLAYLISTS = 'https://api.spotify.com/v1/me/playlists';
  private readonly DEVICES = 'https://api.spotify.com/v1/me/player/devices';
  private readonly PLAY = 'https://api.spotify.com/v1/me/player/play';
  private readonly PAUSE = 'https://api.spotify.com/v1/me/player/pause';
  private readonly NEXT = 'https://api.spotify.com/v1/me/player/next';
  private readonly PREVIOUS = 'https://api.spotify.com/v1/me/player/previous';
  private readonly PLAYER = 'https://api.spotify.com/v1/me/player';
  private readonly TRACKS = 'https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks';
  private readonly CURRENTLYPLAYING = 'https://api.spotify.com/v1/me/player/currently-playing';
  private readonly SHUFFLE = 'https://api.spotify.com/v1/me/player/shuffle';

  constructor(private http: HttpClient) {}

  onPageLoad(): void {
    this.client_id = localStorage.getItem('client_id') || '';
    this.client_secret = localStorage.getItem('client_secret') || '';
    const queryString = window.location.search;
    if (queryString.length > 0) {
      this.handleRedirect();
    } else {
      this.access_token = localStorage.getItem('access_token');
      if (this.access_token === null) {
        document.getElementById('tokenSection'); 
      } else {
        document.getElementById('deviceSection'); 
        this.refreshDevices();
        this.refreshPlaylists();
        this.currentlyPlaying();
      }
    }
    this.refreshRadioButtons();
  }

  private handleRedirect(): void {
    const code = this.getCode();
    if (code) {
      this.fetchAccessToken(code);
      window.history.pushState('', '', this.redirect_uri);
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

  requestAuthorization(clientId: string, clientSecret: string): void {
    this.client_id = clientId;
    this.client_secret = clientSecret;
    localStorage.setItem('client_id', clientId);
    localStorage.setItem('client_secret', clientSecret);

    let url = `${this.AUTHORIZE}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirect_uri)}&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private`;
    window.location.href = url;
  }

  private fetchAccessToken(code: string): void {
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(this.redirect_uri)}&client_id=${this.client_id}&client_secret=${this.client_secret}`;
    this.callAuthorizationApi(body);
  }

  private refreshAccessToken(): void {
    this.refresh_token = localStorage.getItem('refresh_token');
    const body = `grant_type=refresh_token&refresh_token=${this.refresh_token}&client_id=${this.client_id}`;
    this.callAuthorizationApi(body);
  }

  private callAuthorizationApi(body: string): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${this.client_id}:${this.client_secret}`)
    });

    this.http.post(this.TOKEN, body, { headers }).subscribe({
      next: (response: any) => this.handleAuthorizationResponse(response),
      error: (err) => alert(err.error)
    });
  }

  private handleAuthorizationResponse(response: any): void {
    if (response.access_token) {
      this.access_token = response.access_token;
      localStorage.setItem('access_token', response.access_token); 
    }
    if (response.refresh_token) {
      this.refresh_token = response.refresh_token;
      localStorage.setItem('refresh_token', response.access_token); 
    }
    this.onPageLoad();
  }

  private refreshDevices(): void {
    this.callApi('GET', this.DEVICES, null, this.handleDevicesResponse.bind(this));
  }

  private handleDevicesResponse(response: any): void {
    if (response.devices) {
      this.removeAllItems('devices');
      response.devices.forEach((item: any) => this.addDevice(item));
    }
  }

  private addDevice(item: any): void {
    const node = document.createElement('option');
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById('devices')!.appendChild(node);
  }

  private callApi(method: string, url: string, body: any, callback: (response: any) => void): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.access_token}`
    });

    this.http.request(method, url, { body, headers }).subscribe({
      next: callback,
      error: (err) => {
        if (err.status === 401) {
          this.refreshAccessToken();
        } else {
          alert(err.error);
        }
      }
    });
  }

  private refreshPlaylists(): void {
    this.callApi('GET', this.PLAYLISTS, null, this.handlePlaylistsResponse.bind(this));
  }

  private handlePlaylistsResponse(response: any): void {
    if (response.items) {
      this.removeAllItems('playlists');
      response.items.forEach((item: any) => this.addPlaylist(item));
    }
  }

  private addPlaylist(item: any): void {
    const node = document.createElement('option');
    node.value = item.id;
    node.innerHTML = `${item.name} (${item.tracks.total})`;
    document.getElementById('playlists')!.appendChild(node);
  }

  private removeAllItems(elementId: string): void {
    const node = document.getElementById(elementId);
    if (node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }
  }

  play(): void {
    const playlist_id = (document.getElementById('playlists') as HTMLSelectElement).value;
    const trackindex = (document.getElementById('tracks') as HTMLInputElement).value;
    const album = (document.getElementById('album') as HTMLInputElement).value;
    const body: any = {
      context_uri: album.length > 0 ? album : `spotify:playlist:${playlist_id}`,
      offset: {
        position: trackindex.length > 0 ? Number(trackindex) : 0,
        position_ms: 0
      }
    };
    this.callApi('PUT', `${this.PLAY}?device_id=${this.deviceId()}`, body, this.handleApiResponse.bind(this));
  }

  shuffle(): void {
    this.callApi('PUT', `${this.SHUFFLE}?state=true&device_id=${this.deviceId()}`, null, this.handleApiResponse.bind(this));
    this.play();
  }

  pause(): void {
    this.callApi('PUT', `${this.PAUSE}?device_id=${this.deviceId()}`, null, this.handleApiResponse.bind(this));
  }

  next(): void {
    this.callApi('POST', `${this.NEXT}?device_id=${this.deviceId()}`, null, this.handleApiResponse.bind(this));
  }

  previous(): void {
    this.callApi('POST', `${this.PREVIOUS}?device_id=${this.deviceId()}`, null, this.handleApiResponse.bind(this));
  }

  transfer(): void {
    const body = { device_ids: [this.deviceId()] };
    this.callApi('PUT', this.PLAYER, body, this.handleApiResponse.bind(this));
  }

  private handleApiResponse(response: any): void {
    if (response) {
      setTimeout(this.currentlyPlaying.bind(this), 2000);
    }
  }

  private deviceId(): string {
    return (document.getElementById('devices') as HTMLSelectElement).value;
  }

  fetchTracks(): void {
    const playlist_id = (document.getElementById('playlists') as HTMLSelectElement).value;
    if (playlist_id.length > 0) {
      const url = this.TRACKS.replace('{{PlaylistId}}', playlist_id);
      this.callApi('GET', url, null, this.handleTracksResponse.bind(this));
    }
  }

  private handleTracksResponse(response: any): void {
    if (response.items) {
      this.removeAllItems('tracks');
      response.items.forEach((item: any, index: number) => this.addTrack(item, index));
    }
  }

  private addTrack(item: any, index: number): void {
    const node = document.createElement('option');
    node.value = index.toString();
    node.innerHTML = `${item.track.name} (${item.track.artists[0].name})`;
    document.getElementById('tracks')!.appendChild(node);
  }

  private currentlyPlaying(): void {
    this.callApi('GET', `${this.PLAYER}?market=US`, null, this.handleCurrentlyPlayingResponse.bind(this));
  }

  private handleCurrentlyPlayingResponse(response: any): void {
    if (response.item) {
      document.getElementById('albumImage')!.setAttribute('src', response.item.album.images[0].url);
      document.getElementById('trackTitle')!.innerHTML = response.item.name;
      document.getElementById('trackArtist')!.innerHTML = response.item.artists[0].name;
    }

    if (response.device) {
      const currentDevice = response.device.id;
      (document.getElementById('devices') as HTMLSelectElement).value = currentDevice;
    }

    if (response.context) {
      const currentPlaylist = response.context.uri.split(':').pop();
      (document.getElementById('playlists') as HTMLSelectElement).value = currentPlaylist!;
    }
  }

  saveNewRadioButton(): void {
    const item = {
      deviceId: this.deviceId(),
      playlistId: (document.getElementById('playlists') as HTMLSelectElement).value
    };
    const radioButtons = this.getRadioButtons();
    radioButtons.push(item);
    localStorage.setItem('radio_button', JSON.stringify(radioButtons));
    this.refreshRadioButtons();
  }

  private refreshRadioButtons(): void {
    const data = localStorage.getItem('radio_button');
    if (data) {
      const radioButtons = JSON.parse(data);
      if (Array.isArray(radioButtons)) {
        this.removeAllItems('radioButtons');
        radioButtons.forEach((item, index) => this.addRadioButton(item, index));
      }
    }
  }

  private onRadioButton(deviceId: string, playlistId: string): void {
    const body = {
      context_uri: `spotify:playlist:${playlistId}`,
      offset: {
        position: 0,
        position_ms: 0
      }
    };
    this.callApi('PUT', `${this.PLAY}?device_id=${deviceId}`, body, this.handleApiResponse.bind(this));
  }

  private addRadioButton(item: { deviceId: string; playlistId: string }, index: number): void {
    const node = document.createElement('button');
    node.className = 'btn btn-primary m-2';
    node.innerText = index.toString();
    node.onclick = () => this.onRadioButton(item.deviceId, item.playlistId);
    document.getElementById('radioButtons')!.appendChild(node);
  }

  private getRadioButtons(): { deviceId: string; playlistId: string }[] {
    const data = localStorage.getItem('radio_button');
    return data ? JSON.parse(data) : [];
  }

  // Método para obtener el id de un usuario de Spotify
  // Se usa el token de acceso del usuario que ha conectado su cuenta de Spotify.
  async fetchUserId(): Promise<any> {
    const token = localStorage.getItem('access_token');

    return new Promise((resolve) => {
      const url = '' + token;
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
      let myRequest = new Request(url, options);

      fetch(myRequest)
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          resolve(data);
        })
        .catch(function (error) {
          console.log(
            'There has been a problem with your fetch operation: ' +
              error.message
          );
          throw error;
        });
    });
  }
}

