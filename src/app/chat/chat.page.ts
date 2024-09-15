import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, take } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ChatService } from '../services/chat/chat.service';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild('new_chat') modal: ModalController;
  @ViewChild('popover') popover: PopoverController;
  segment = 'chats';
  open_new_chat = false;
  users: Observable<any[]>;
  chatRooms: Observable<any[]>;
  model = {
    icon: 'chatbubbles-outline',
    title: 'No Matches Yet',
    color: 'danger'
  };

  constructor(private firebaseService: FirebaseService, 
              private route: ActivatedRoute,
              private router: Router,
              private chatService: ChatService
  ) { }

  ngOnInit() {
    this.getRooms();
    this.getUsers();
  }

  getRooms() {
    // this.chatService.getId();
    this.chatService.getChatRooms();
    this.chatRooms = this.chatService.chatRooms;
    console.log('chatrooms: ', this.chatRooms);
  }

  onSegmentChanged(event: any) {
    console.log(event);
    this.segment = event.detail.value;
  }

  newChat() {
    this.open_new_chat = true;
    if(!this.users) this.getUsers();
  }

  getUsers() {
    // this.chatService.getUsers();
    this.chatService.getMatchedUsers();
    this.users = this.chatService.users;
    console.log("Users: ", this.users)
  }

  onWillDismiss(event: any) {}

  cancel() {
    this.modal.dismiss();
    this.open_new_chat = false;
  }

  async startChat(item) {
    try {
      // this.global.showLoader();
      // create chatroom
      const room = await this.chatService.createChatRoom(item?.uid);
      console.log('room: ', room);
      this.cancel();
      const navData: NavigationExtras = {
        queryParams: {
          name: item?.name
        }
      };
      this.router.navigate(['/', 'chat', 'chats', room?.id], navData); // home
      // this.global.hideLoader();
    } catch(e) {
      console.log(e);
      // this.global.hideLoader();
    }
  }

  getChat(item) {
    (item?.user).pipe(
      take(1)
    ).subscribe(user_data => {
      console.log('data: ', user_data);
      const navData: NavigationExtras = {
        queryParams: {
          name: user_data?.name
        }
      };
      this.router.navigate(['/', 'chat', 'chats', item?.id], navData);
    });
  }

  getUser(user: any) {
    return user;
  }

  signOut() {
    this.firebaseService.signout();
  }

}