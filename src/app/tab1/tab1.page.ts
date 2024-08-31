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
  userId: string = '';  
  events: any[] = []; 
  evento: any; 
  filteredEvents: any[] = [];
  searchTerm: string = '';  

  constructor(private activatedRoute: ActivatedRoute, private ticketmasterAPIService: TicketmasterService, private firestore: AngularFirestore, private spotifyService: SpotifyService) {}

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  ngOnInit() {
    // this.spotifyService.onPageLoad();

    // Load initial events by postal code
    console.log(this.ticketmasterAPIService.getEventsByPostalCode('08038')) // Madrid '28009'

    const eventsPromise = this.ticketmasterAPIService.getEventsByPostalCode('08038');
    const eventsObservable = from(eventsPromise);

    eventsObservable.subscribe(
      (result) => {
        this.evento = result;
      },
      (err) => {
        console.log(err);
      }
    );

    // uid
    const user = this.utilsService.getFromLocalStorage('user'); 
    if (user && user.uid) {
      this.userId = user.uid;
    } else {
      console.error('User ID is not available');
    }
  }
  
  // TODO: Use user's postal code
  // TODO: Display "No events available" if none found
  async loadEventsByPostalCode(postalCode: string) {
    try {
      this.evento = await this.ticketmasterAPIService.getEventsByPostalCode(postalCode);
      this.filteredEvents = this.evento;
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  async filterEvents(searchTerm: string) {
    console.log("SearchTerm: " + searchTerm)

    if (!searchTerm) {
      this.events = [];
      return;
    }

    try {
      // Call getEventsByArtist with the searchTerm
      this.evento = await this.ticketmasterAPIService.getEventsByArtist(searchTerm);
      this.filteredEvents = this.evento;
      console.log(this.evento)
    } catch (error) {
      console.error('Error filtering events:', error);
      this.filteredEvents = [];
    }
  }

  // Function to add an event when the user clicks the "Add" button
  async addEvent(eventId: string) {
    const loading = await this.utilsService.loading();
    await loading.present();

    if (!this.userId) {
      throw new Error('User ID is missing');
    }  

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