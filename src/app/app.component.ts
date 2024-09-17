import { Component, NgZone } from '@angular/core';
import { NotificationsPushService } from './services/notifications/notifications-push.service';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SpotifyService } from './api/spotify/spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router,
              private zone: NgZone,
              private spotify: SpotifyService,
              private notificationsService: NotificationsPushService) {
               
              this.initializeApp();
  }

  initializeApp() {
    // Notifications 
    if(Capacitor.isNativePlatform()) {
      this.notificationsService.init();
    }

    // Spotify Auth
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        console.log("App Listener")
        this.zone.run(async () => {
          if (event.url.split('code=').length > 0) {
            const code = event.url.split('code=')[1]
            ///
            try {
              await this.spotify.exchangeCodeForToken(code); // Exchange code for token
              this.router.navigateByUrl('/tabs/tab1'); // Navigate to main page
            } catch (error) {
              console.error('Error during token exchange:', error);
            }
          }
        });
    });
  }
}
