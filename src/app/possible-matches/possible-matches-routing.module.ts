import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PossibleMatchesPage } from './possible-matches.page';

const routes: Routes = [
  {
    path: '',
    component: PossibleMatchesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PossibleMatchesPageRoutingModule {}
