import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketmasterService } from '../api/ticketmaster/ticketmaster.service'
import { from } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SpotifyService } from '../api/spotify/spotify.service';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  evento: any; 
  userId: string = '';  
  events: any[] = [];   

  constructor(private activatedRoute: ActivatedRoute, private ticketmasterAPIService: TicketmasterService, private firestore: AngularFirestore, private spotifyService: SpotifyService) {}

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  ngOnInit() {
    // this.spotifyService.onPageLoad();
    console.log(this.ticketmasterAPIService.getEventsByPostalCode('08038')) // Madrid '28009'

    const eventsPromise = this.ticketmasterAPIService.getEventsByPostalCode('08038');
    const eventsObservable = from(eventsPromise);

    eventsObservable.subscribe(
      (result) => {
        this.evento = result;
        console.log('Event info:' + this.evento)
      },
      (err) => {
        console.log(err);
      }
    );

    const user = this.utilsService.getFromLocalStorage('user'); 
    if (user && user.uid) {
      this.userId = user.uid;
    } else {
      console.error('User ID is not available');
    }
  }

  // Function to add an event when the user clicks the "Add" button
  async addEvent(eventId: string) {
    const loading = await this.utilsService.loading();
    await loading.present();

    this.firebaseService.addEventToUser(this.userId, eventId)
      .then(() => {
        this.utilsService.presentToast({
          message: 'Event added successfully!',
          duration: 2000,
          position: 'bottom',
          icon: 'checkmark-circle-outline'
        });
      })
      .catch((error) => {
        this.utilsService.presentToast({
          message: 'Error adding event: ' + error.message,
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

  signOut() {
    this.firebaseService.signout();
  }

}