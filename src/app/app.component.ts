import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SpotifyService } from './api/spotify/spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private router: Router,
    private zone: NgZone,
    private spotify: SpotifyService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        this.zone.run(() => {
          if (event.url.split('code=').length > 0) {
            const code = event.url.split('code=')[1]
          }
        });
    });
}
}