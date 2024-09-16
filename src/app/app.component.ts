import { Component } from '@angular/core';
import { NotificationsPushService } from './services/notifications/notifications-push.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private notificationsService: NotificationsPushService) {
    this.init();
  }

  init() {
    if(Capacitor.isNativePlatform()) {
      this.notificationsService.init();
    }
  }
}
