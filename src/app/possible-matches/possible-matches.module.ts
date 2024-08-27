import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PossibleMatchesPageRoutingModule } from './possible-matches-routing.module';

import { PossibleMatchesPage } from './possible-matches.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PossibleMatchesPageRoutingModule,
    SharedModule
  ],
  declarations: [PossibleMatchesPage]
})
export class PossibleMatchesPageModule {}
