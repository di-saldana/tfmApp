import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../api/spotify/spotify.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SpotifyTokenService } from 'src/app/api/spotify/spotify-token.service';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  artistInput: any;
  venueInput: any;
  userInput: any;

  userAuthenticated: boolean = false;
  connectedSpotifyButtonText: string = 'Connect to';

  constructor(private spotifyService: SpotifyService, private accessTokenService: SpotifyaccesstokenServiceService,
    private router: Router) { }

  async onAuthClick() {
    //Autenticación con Spotify
    const openAuthSite = async () => {
      await Browser.open({
        url: '',
        windowName: '_self',
      });
    };

    openAuthSite();
    
    // Suscribirse al evento appUrlOpen y poder manejar los datos
    // que se reciben de la API.
    App.addListener('appUrlOpen', (data: any) => {
      // Obtener la URL del evento
      const url = data.url;

      // Obtener y manejar los parámetros de la URL que se reciben
      // de la API con el nombre de authData
      const params = new URL(url).searchParams;
      const authData = params.get('authData');

      // Manejar los datos obtenidos guardandolos en el local storage
      if (authData) {
        const decodedAuthData = decodeURIComponent(authData);
        const parsedData = JSON.parse(decodedAuthData);
        localStorage.setItem('auth_object', parsedData);
        localStorage.setItem('refresh_token', parsedData.refresh_token);
        localStorage.setItem('access_token', parsedData.access_token);
        window.location.reload();
      }
    });
  }

  ngOnInit1() {
    this.spotifyService.onPageLoad();
  }

  async ngOnInit() {
    // Se obtiene el access token inicial de Spotify sin que el usuario
    // tenga que hacer login. Se usa el servicio de SpotifyaccesstokenServiceService
    const initAccessToken: any = await this.accessTokenService.getInitToken();
    console.log('Init Token: ' + initAccessToken);

    // Se guarda el access token inicial en el local storage
    localStorage.setItem('init_access_token', initAccessToken);

    // Se comprueba que el usuario esté ya autenticado
    // Si el usuario está autenticado, se actualiza el estado a true
    // y se obtiene el refresh token.
    const authObjectJson = localStorage.getItem('auth_object');
    const refreshToken = localStorage.getItem('refresh_token');

    if (authObjectJson) {
      this.userAuthenticated = true;
    }

    if (refreshToken && refreshToken !== 'undefined') {
      this.accessTokenService.getRefreshToken();
    }
  }

  // Función para desconectar al usuario de Spotify
  deleteAuth() {
    localStorage.clear();
    window.location.reload();
  }

  requestAuthorization(): void {
    const clientId = "63e107aee6b549d980b4075dcd9a93f2" 
    const clientSecret = "6a0b6804cd0448c8ad35fb1da92925e3" 
    this.spotifyService.requestAuthorization(clientId, clientSecret);
  }

  fetchTracks(): void {
    this.spotifyService.fetchTracks();
  }

  play(): void {
    this.spotifyService.play();
  }

  shuffle(): void {
    this.spotifyService.shuffle();
  }

  pause(): void {
    this.spotifyService.pause();
  }

  next(): void {
    this.spotifyService.next();
  }

  previous(): void {
    this.spotifyService.previous();
  }

  transfer(): void {
    this.spotifyService.transfer();
  }
}
