import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpotifyTokenService {

  client_id = '63e107aee6b549d980b4075dcd9a93f2'; 
  url = 'https://accounts.spotify.com/api/token';
  redirect_uri = 'https://us-central1-tfm-app-dsl.cloudfunctions.net/callback';// 'https://tfm-app-dsl.firebaseapp.com/__/auth/handler'; // 'http://localhost:8100/tabs/tab1'; // 'es.ua.mastermoviles.dsl.tfm';

  constructor() {}

  // Método para refrescar el access token de Spotify
  getRefreshToken = async () => {
    const refreshToken: any = localStorage.getItem('refresh_token');
    const url = 'https://accounts.spotify.com/api/token';

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.client_id,
      }),
    };
    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem('auth_object', response);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('access_token', response.access_token);
  };


  // Método para obtener el access token inicial de Spotify. Sin que
  // el usuario tenga que hacer login. Y así obtener los datos de
  // los artistas y de las canciones que se muestran en la página de cada
  // setlist sin estar logueado en Spotify.
  getInitToken = () => {
    return new Promise(async (resolve) => {
      const url = 'https://us-central1-tfm-app-dsl.cloudfunctions.net/callback'; // 'https://tfm-app-dsl.firebaseapp.com/__/auth/handler'; 
      const options = {
        method: 'POST',
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
          console.log(data);
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
  };
}

