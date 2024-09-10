import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-possible-matches',
  templateUrl: './possible-matches.page.html',
  styleUrls: ['./possible-matches.page.scss'],
})
export class PossibleMatchesPage implements OnInit {

  // profiles = [
  //   {
  //     name: 'Sara',
  //     age: '20',
  //     image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
  //     location: 'New York',
  //     events: ['Event 1', 'Event 2'],
  //     artists: ['Phoebe Bridgers', 'Arlo Parks']
  //     // Mostrar todos sus eventos pero solo resaltar (con otro color) los eventos en los cuales ambos matchearon
  //   },
  //   {
  //     name: 'Miguel',
  //     age: '30',
  //     image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
  //     location: 'Spain',
  //     events: ['Event 1', 'Event 2', 'Event 3'],
  //     artists: ['Young the Giant', 'Izal']
  //   }
  // ];

  userId: string = '';  
  userName: string = '';
  event_name: string = '';
  profiles: any[] = [];
  events: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const user = this.utilsService.getFromLocalStorage('user'); 
    if (user && user.uid) {
      this.userId = user.uid;
      this.userName = user.name;

      // Retrieve the event_name from query parameters
      this.route.queryParams.subscribe(params => {
        this.event_name = params['event'];
        this.loadUsersInterestedInEvent(this.event_name);
        this.loadSavedEvents(user.uid);
      }); 
    } else {
      console.error('User ID is not available');
      this.router.navigate(['/auth']);
    }
  }

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  goToProfile(profile: any) {
    this.router.navigate(['/tabs/tab3'], { queryParams: { profileId: profile.id, profileName: profile.name } });
  }

  async loadUsersInterestedInEvent(event_name: string) {
    try {
      const user = this.utilsService.getFromLocalStorage('user');
      if (user && user.uid) {
        this.profiles = await this.firebaseService.getUsersByEvent(event_name, user.uid);
        console.log('Profiles:', this.profiles);  // Log to verify structure
      } else {
        console.error('User ID is not available');
      }
    } catch (error) {
      console.error('Error fetching interested users:', error);
    }
  }

  // Method to load saved events
  loadSavedEvents(userId: string) {
    this.firebaseService.getSavedEvents(userId).subscribe(
      events => {
        this.events = events;
        console.log('Saved Events:', this.events);
      },
      error => {
        console.error('Error loading saved events:', error);
      }
    );
  }

  // Function to add another user to the invite list when the user clicks the "Add" button
  // TODO: Delete card from list
  // TODO: Send notification
  async addInvite(userIdB: string, eventId: string) {
    const loading = await this.utilsService.loading();
    await loading.present();

    this.firebaseService.addInviteToUser(this.userId, userIdB, eventId)
      .then(() => {
        this.utilsService.presentToast({
          message: 'Invite sent successfully!',
          duration: 2000,
          position: 'bottom',
          icon: 'checkmark-circle-outline'
        });
      })
      .catch((error) => {
        this.utilsService.presentToast({
          message: 'Error sending invite: ' + error.message,
          duration: 2500,
          position: 'bottom',
          icon: 'alert-circle-outline'
        });
        console.error('Error adding event: ', error);
      })
      .finally(() => {
        loading.dismiss();
      });
  }
}