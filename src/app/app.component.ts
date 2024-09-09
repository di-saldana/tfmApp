import { Component, NgZone } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SpotifyService } from './api/spotify/spotify.service';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private zone: NgZone,
    private spotify: SpotifyService,
    private firebase: FirebaseService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(async () => {
        if (event.url.includes('code=')) {
          const code = event.url.split('code=')[1];
          try {
            // Exchange code for access token
            await this.spotify.exchangeCodeForToken(code);
  
            // Use the access token to get Spotify user
            // this.spotify.getProfile()
            // this.firebase.handleSpotifyLogin()

          } catch (error) {
            console.error('Error during Spotify OAuth process: ', error);
          }
        }
      });
    });
  }
  
}