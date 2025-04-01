import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { SpotifyService } from '../api/spotify/spotify.service';

// Swiper
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-slides-intro',
  templateUrl: './slides-intro.page.html',
  styleUrls: ['./slides-intro.page.scss'],
})
export class SlidesIntroPage implements OnInit {

  constructor(private spotifyService: SpotifyService) { }

  utilsService = inject(UtilsService);

  ngOnInit() {}

    // Spotify Authentication
    async onAuthClick() {
      console.log("Auth button clicked");
      try {
        // Start the Spotify authorization flow
        await this.spotifyService.requestAuthorization();
        
      } catch (error) {
        console.error('Error during Spotify authentication:', error);
  
        this.utilsService.presentToast({
          message: error.message || 'Spotify login failed',
          duration: 2500,
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }
    }
}