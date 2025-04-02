import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpotifyButtonPage } from './spotify-button.page';

const routes: Routes = [
  {
    path: '',
    component: SpotifyButtonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpotifyButtonPageRoutingModule {}
