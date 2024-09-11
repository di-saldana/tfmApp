import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat/chat.service';
import { FirebaseService } from '../services/firebase.service';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  firebaseService = inject(FirebaseService);

  profiles = [
    {
      name: 'Sara',
      age: '20',
      image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      location: 'New York',
      events: ['Event 1'],
      artists: ['Phoebe Bridgers', 'Arlo Parks']
      // Mostrar todos sus eventos pero solo resaltar (con otro color) los eventos en los cuales ambos matchearon
    },
    {
      name: 'Miguel',
      age: '30',
      image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      location: 'Spain',
      events: ['Event 3'],
      artists: ['Young the Giant', 'Izal']
    }
  ];

  users: any[] = [];
  // users: { id: number, name: string, photo: string }[] = [];
  // users = [
  //   { id: 1, name: "Lola", photo: "https://i.pravatar.cc/315" }, 
  //   { id: 2, name: "Lolo", photo: "https://i.pravatar.cc/325" }, 
  // ];

  chatRooms = [
    { id: 1, name: "Lola", photo: "https://i.pravatar.cc/315" }, 
    { id: 2, name: "Lolo", photo: "https://i.pravatar.cc/325" }, 
  ];

  constructor(private router: Router, private chatService: ChatService) {}

  startChat(item: any) {

  }

  getChat(item: any) {
    this.router.navigate(['/', 'chat', item?.id]); 
  }

  goToChat(profile: any) {
    // Matches page
    this.router.navigate(['/tabs/tab2'], { queryParams: { profileId: profile.id, profileName: profile.name } });
  }

  goToProfile(profile: any) {
    this.router.navigate(['/tabs/tab3'], { queryParams: { profileId: profile.id, profileName: profile.name } });
  }

  // getUsers() {
  //   this.chatService.getUsers();
  //   this.users = this.chatService.users;
  // }

  getUsers1() {
    // Subscribe to the observable to get the data
    // this.chatService.getUsers().subscribe((usersData: any[]) => {
    //   this.users = usersData.map(user => ({
    //     id: user.id,
    //     name: user.name,
    //     photo: user.photo
    //   }));
    // });

    this.firebaseService.getAllUsers('lUxWag5mPRe21PgYHo9UfpTf8iq2');
    console.log(this.firebaseService.getAllUsers('lUxWag5mPRe21PgYHo9UfpTf8iq2'))
  }

  async getUsers() {
    try {
      // Wait for the Promise to resolve and assign the result to this.users
      this.users = await this.firebaseService.getAllUsers('lUxWag5mPRe21PgYHo9UfpTf8iq2');
      
      // Log the result for debugging
      console.log(this.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
}
