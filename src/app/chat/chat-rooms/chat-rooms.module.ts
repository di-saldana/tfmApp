import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatRoomsPageRoutingModule } from './chat-rooms-routing.module';

import { ChatRoomsPage } from './chat-rooms.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChatBoxComponent } from 'src/app/shared/components/chat-box/chat-box.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatRoomsPageRoutingModule,
    SharedModule
  ],
  declarations: [ChatRoomsPage, ChatBoxComponent]
})
export class ChatRoomsPageModule {}
