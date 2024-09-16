import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { LocationService } from '../services/location/location.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-possible-matches',
  templateUrl: './possible-matches.page.html',
  styleUrls: ['./possible-matches.page.scss'],
})
export class PossibleMatchesPage implements OnInit {
  userId: string = '';  
  userName: string = '';
  userAge: number = 25;
  saved_events: any[] = [];
  event_name: string = '';
  favoriteAlbums: any[] = [] 
  profiles: any[] = []; // Users with same saved events
  possible_matches: any[] = []; 
  userFlag: string;

  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private locationService: 
    LocationService,
    private http: HttpClient) {}

  ngOnInit() {
    const userAuth = this.firebaseService.getAuth().currentUser;
    console.log("Authenticated User: ", userAuth);

    const user = this.utilsService.getFromLocalStorage('user');
    console.log("USER: ", user, "\n\n")
    if (user && user.uid) {
      this.userId = user.uid;
      this.userName = user.name;
      this.userAge = user.age;

      // Retrieve the event_name from query parameters from tab3
      // this.route.queryParams.subscribe(params => {
      //   this.event_name = params['event'];
      //   this.loadSavedEvents(user.uid);
      //   this.loadUsersInterestedInEvent(this.event_name);
      // }); 
  
      // Para asegurar que `loadSavedEvents` se completa antes de llamar a `loadAllUsers`
      this.loadSavedEvents(user.uid).then(() => {
        this.loadAllUsers();
        this.loadTopAlbums();
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
        const profiles = await this.firebaseService.getUsersByEvent(event_name, user.uid);
        console.log('Profiles for event:', event_name, profiles);  // Log to verify structure
        return profiles;  // Return the profiles array instead of assigning it to `this.profiles`
      } else {
        console.error('User ID is not available');
        return [];
      }
    } catch (error) {
      console.error('Error fetching interested users:', error);
      return [];
    }
  }

  async loadAllUsers() {
    console.log('Loading all users...');
    const loading = await this.utilsService.loading(); 
    await loading.present();
  
    let possible_matches: any[] = [];  // Local variable to hold matches during the process
  
    // Iterate over each saved event of the current user
    for (const event of this.saved_events) {
      console.log(`Fetching users interested in event: ${event}`);
      const profiles = await this.loadUsersInterestedInEvent(event); // Fetch users interested in this event
      
      console.log(`Profiles interested in event "${event}":`, profiles);
  
      // Use a for...of loop to handle async operations
      for (const profile of profiles) {
        console.log(`Checking profile: ${profile.name}, with events: ${profile.saved_events}`);
        console.log("Profile pic: ", profile.profile_picture);
        const commonEvents = profile.saved_events.filter((e: string) => this.saved_events.includes(e));
        const topAlbums = await this.loadTopAlbumsForUser(profile.uid);

        // If there are common events, add the profile to possible_matches
        if (commonEvents.length > 0) {
          const flag = await this.getUserFlag(profile.uid); // Await the flag fetch
          console.log('User flag:', flag);
          possible_matches.push({
            name: profile.name,
            uid: profile.uid,
            age: profile.age,
            flag: flag,
            image: profile.profile_picture || 'https://ionicframework.com/docs/img/demos/avatar.svg',
            common_events: commonEvents,
            saved_events: profile.saved_events,
            top_albums: topAlbums,
            location: profile.location || 'Unknown', // TODO: Borrar
            distance: profile.distance || 'Unknown' // TODO: Borrar
          });
        }
      }
    }
  
    // Only update `this.possible_matches` after processing all events
    this.possible_matches = possible_matches;
    console.log('Final Possible Matches:', this.possible_matches);
    await loading.dismiss();
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
          duration: 1500,
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      })
      .catch((error) => {
        this.utilsService.presentToast({
          message: 'Error sending invite: ' + error.message,
          duration: 1500,
          position: 'middle',
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
          duration: 1500,
          position: 'middle',
          icon: 'heart'
        });
      } else {
        // Invite sent but not a match yet
        this.utilsService.presentToast({
          message: 'Invite sent successfully!',
          duration: 1500,
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      }
    } catch (error) {
      console.error('Error in sending invite or matching:', error);
      this.utilsService.presentToast({
        message: 'Error sending invite: ' + error.message,
        duration: 1500,
          position: 'middle',
        icon: 'alert-circle-outline'
      });
    }
  }

  async loadTopAlbums() {
    const apiUrl = 'https://ws.audioscrobbler.com/2.0/';
    const apiKey = '6b949ae3e54e839ec00f53bf82c6a120';  // Last.fm API key
  
    try {
      // Retrieve the user object from local storage or Firebase
      const user = this.utilsService.getFromLocalStorage('user');
      
      // Fetch last_fm_id from Firebase
      const userProfile = await this.firebaseService.getUserProfile(user.uid);
      const lastFmId = userProfile.last_fm_id;
  
      if (!lastFmId) {
        console.error('No Last.fm ID found for user');
        return;
      }
  
      const params = {
        method: 'user.getTopAlbums',
        user: lastFmId,
        limit: '4',
        api_key: apiKey,
        format: 'json'
      };
  
      // Fetch the top albums from Last.fm API
      const response: any = await this.http.get(apiUrl, { params }).toPromise();
      this.favoriteAlbums = response.topalbums.album.map((album: any) => ({
        name: album.name,
        image: album.image.find((img: any) => img.size === 'large')?.['#text'] || 'https://ionicframework.com/docs/img/demos/card-media.png'
      }));
      
    } catch (error) {
      console.error('Error fetching top albums: ', error);
    }
  }  

  // Fetch top albums based on a user's Last.fm ID from Firebase
  async loadTopAlbumsForUser(userId: string): Promise<any[]> {
    const apiUrl = 'https://ws.audioscrobbler.com/2.0/';
    const apiKey = '6b949ae3e54e839ec00f53bf82c6a120';  // Last.fm API key
    
    try {
      // Fetch user profile from Firebase
      const userProfile = await this.firebaseService.getUserProfile(userId);
      const lastFmId = userProfile.last_fm_id;

      if (!lastFmId) {
        console.error('No Last.fm ID found for user:', userId);
        return [];
      }

      const params = {
        method: 'user.getTopAlbums',
        user: lastFmId,
        limit: '4',
        api_key: apiKey,
        format: 'json'
      };

      // Fetch the top albums from Last.fm API
      const response: any = await this.http.get(apiUrl, { params }).toPromise();
      
      return response.topalbums.album.map((album: any) => ({
        name: album.name,
        image: album.image.find((img: any) => img.size === 'large')?.['#text'] || 'https://ionicframework.com/docs/img/demos/card-media.png'
      }));

    } catch (error) {
      console.error('Error fetching top albums for user:', userId, error);
      return [];
    }
  }

  async getUserFlag(userId: string): Promise<string> {
    try {
      return await this.locationService.getUserCountryFlag(userId);
    } catch (error) {
      console.error('Error getting user flag:', error);
      return '🏳'; // Return a default flag if there is an error
    }
  }

}