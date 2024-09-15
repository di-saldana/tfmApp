import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';

import { ChatPage } from './chat.page';
import { SharedModule } from '../shared/shared.module';
import { UserListComponent } from '../shared/components/user-list/user-list.component';
import { ChatBoxComponent } from '../shared/components/chat-box/chat-box.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    SharedModule
  ],
  declarations: [ChatPage, UserListComponent] // ChatBoxComponent
})
export class ChatPageModule {}
