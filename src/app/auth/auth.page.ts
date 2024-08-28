import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';
import { SpotifyService } from '../api/spotify/spotify.service';
import { SpotifyTokenService } from 'src/app/api/spotify/spotify-token.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  userAuthenticated: boolean = false;

  constructor(private spotifyService: SpotifyService, private accessTokenService: SpotifyTokenService) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]), 
    password: new FormControl('', [Validators.required]) 
  })

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  ngOnInit() {
    this.spotifyService.onPageLoad();
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      this.firebaseService.signin(this.form.value as User).then(res => {
        // console.log(res);
        this.getUserInfo(res.user.uid);
        this.utilsService.routerLink('/tabs'); 
        this.form.reset();
      }).catch(error => {
        console.log(error);

        this.utilsService.presentToast({
          message: error.message,
          duration: 2500,
          position: 'middle',
          icon: 'alert-circle-outline'
        })
      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      let path = `users/${uid}`;

      this.firebaseService.getDocument(path).then((user: User) => {
        this.utilsService.saveInLocalStorage('user', user)
        this.utilsService.routerLink('/tabs'); 
        this.form.reset();

        this.utilsService.presentToast({
          message: `Welcome Pal, ${user.name}!`,
          duration: 1500,
          position: 'middle',
          icon: 'person-circle-outline'
        })
      }).catch(error => {
        console.log(error);
      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  // Spotify Authentication - Local
  requestAuthorization(): void {
    const clientId = "63e107aee6b549d980b4075dcd9a93f2" 
    const clientSecret = "6a0b6804cd0448c8ad35fb1da92925e3" 
    this.spotifyService.requestAuthorization(clientId, clientSecret);
  }

  // Spotify Authentication - Firebase
  async onAuthClick() {
    const client_id = '63e107aee6b549d980b4075dcd9a93f2';
    const redirect_uri = 'https://tfm-app-dsl.firebaseapp.com/__/auth/handler'; // 'https://us-central1-tfm-app-dsl.cloudfunctions.net/callback'; // 'http://localhost:8100/tabs/tab1';
    const scopes = 'user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private';
    
    // Construct the Spotify authorization URL
    const AUTHORIZE = 'https://accounts.spotify.com/authorize';
    const url = `${AUTHORIZE}?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}`;
    
    // Redirect the user to Spotify for authorization
    window.location.href = url;
  }

  /*
  async ngOnInit() {
    // this.spotifyService.onPageLoad();

    // Se obtiene el access token inicial de Spotify sin que el usuario
    // tenga que hacer login. Se usa el servicio de SpotifyaccesstokenServiceService
    // const initAccessToken: any = await this.accessTokenService.getInitToken();
    // console.log('Init Token: ' + initAccessToken);

    // Se guarda el access token inicial en el local storage
    // localStorage.setItem('init_access_token', initAccessToken);

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
*/

  // Función para desconectar al usuario de Spotify
  deleteAuth() {
    localStorage.clear();
    window.location.reload();
  }

}
