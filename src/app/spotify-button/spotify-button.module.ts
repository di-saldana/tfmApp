import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SpotifyButtonPageRoutingModule } from './spotify-button-routing.module';

import { SpotifyButtonPage } from './spotify-button.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpotifyButtonPageRoutingModule
  ],
  declarations: [SpotifyButtonPage]
})
export class SpotifyButtonPageModule {}
