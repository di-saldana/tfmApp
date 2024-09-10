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

  /*
    - possible_matches = [
        {
          name: "User 2", 
          uid: "gaergSFSFSasda", 
          age: '20',
          image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          saved_events: ["Residente", "Camilo"], 
          location: 'New York',
          distance: "2 miles"
        },
        {
          name: "User 3", 
          uid: "gaergSFSFSasdax", 
          age: '30',
          image: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          saved_events: ["Black Pumas", "Hozier"], 
          location: 'Madrid',
          distance: "12 km"
        }
      ]
  */

  userId: string = '';  
  userName: string = '';
  saved_events: any[] = [];
  event_name: string = '';
  profiles: any[] = []; // Users with same saved events
  possible_matches: any[] = []; 

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const userAuth = this.firebaseService.getAuth().currentUser;
    console.log("Authenticated User: ", userAuth);

    const user = this.utilsService.getFromLocalStorage('user');
    console.log("USER: ", user, "\n\n")
    if (user && user.uid) {
      this.userId = user.uid;
      this.userName = user.name;

      // Retrieve the event_name from query parameters from tab3
      // this.route.queryParams.subscribe(params => {
      //   this.event_name = params['event'];
      //   this.loadSavedEvents(user.uid);
      //   this.loadUsersInterestedInEvent(this.event_name);
      // }); 
  
      // Para asegurar que `loadSavedEvents` se completa antes de llamar a `loadAllUsers`
      this.loadSavedEvents(user.uid).then(() => {
        this.loadAllUsers();
      }).catch(error => {
        console.error('Error loading saved events:', error);
      });
    } else {
      console.error('User ID is not available');
      this.router.navigate(['/auth']);
    }
  }  

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  // TODO: Implement correctly
  goToProfile(profile: any) {
    this.router.navigate(['/tabs/tab3'], { queryParams: { profileId: profile.id, profileName: profile.name } });
  }

  async loadUsersInterestedInEvent(event_name: string): Promise<any[]> {
    try {
      const user = this.utilsService.getFromLocalStorage('user');
      if (user && user.uid) {
        this.profiles = await this.firebaseService.getUsersByEvent(event_name, user.uid);
        console.log('Profiles: ', this.profiles);  // Log to verify structure
        return this.profiles;  // Return the profiles array
      } else {
        console.error('User ID is not available');
        return [];
      }
    } catch (error) {
      console.error('Error fetching interested users:', error);
      return [];
    }
  }  

  // TODO: Fix bug -> Si el current user tiene mas de 2 saved_events, no muestra nada
  // Al parecer solo esta anadiendo a 'profiles' usuarios que tenga todos los mismos eventos en comun. 
  // Es decir, si tienen un artista que no esta en sus saved_events lo descarta o reescribe
  async loadAllUsers() {
    console.log('Loading all users...');
  
    const possible_matches: any[] = []; 
  
    // Iterate over each saved event of the current user
    for (const event of this.saved_events) {
      console.log(`Fetching users interested in event: ${event}`);
      await this.loadUsersInterestedInEvent(event); // Fetch users interested in this event
      
      console.log(`Profiles interested in event "${event}":`, this.profiles);
  
      // Process the fetched profiles to filter and add to possible_matches
      this.profiles.forEach(profile => {
        // Ensure profiles have saved_events to compare
        console.log(`Checking profile: ${profile.name}, with events: ${profile.saved_events}`);
        console.log("Profile pic: ", profile.profile_picture)
        const commonEvents = profile.saved_events.filter((e: string) => this.saved_events.includes(e));
        // TODO: Change ion-chip color of commonEvents
        
        // If there are common events, add the profile to possible_matches
        if (commonEvents.length > 0) {
          possible_matches.push({
            name: profile.name,
            uid: profile.uid,
            age: profile.age,
            image: profile.profile_picture || 'https://ionicframework.com/docs/img/demos/avatar.svg',
            saved_events: commonEvents,
            location: profile.location || 'Unknown',
            distance: profile.distance || 'Unknown'
          });
        }
      });
    }
  
    // Final possible matches
    console.log('Possible Matches:', possible_matches);
  }  

  // Method to load saved saved_events
  loadSavedEvents(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getSavedEvents(userId).subscribe(
        saved_events => {
          this.saved_events = saved_events;
          console.log('Saved Events: ', this.saved_events);
          resolve(); // Resolve the promise once events are loaded
        },
        error => {
          console.error('Error loading saved events: ', error);
          reject(error); // Reject the promise on error
        }
      );
    });
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

  // Add an invite and check for a match
  async addInviteAndCheckMatch(userIdB: string) {
    try {
      // 1. Add invite from current user (userId) to userB (userIdB)
      await this.firebaseService.addInvite(this.userId, userIdB);

      // 2. Check if userB has already invited the current user
      const isMatched = await this.firebaseService.checkForInvite(userIdB, this.userId);

      if (isMatched) {
        // 3. If userB has already invited, add them to matches
        await this.firebaseService.addMatch(this.userId, userIdB);

        // Notify users about the match
        this.utilsService.presentToast({
          message: 'It\'s a match!',
          duration: 2000,
          position: 'bottom',
          icon: 'heart'
        });
      } else {
        // Invite sent but not a match yet
        this.utilsService.presentToast({
          message: 'Invite sent successfully!',
          duration: 2000,
          position: 'bottom',
          icon: 'checkmark-circle-outline'
        });
      }
    } catch (error) {
      console.error('Error in sending invite or matching:', error);
      this.utilsService.presentToast({
        message: 'Error sending invite: ' + error.message,
        duration: 2500,
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
    }
  }

}