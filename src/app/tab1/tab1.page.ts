import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketmasterService } from '../api/ticketmaster/ticketmaster.service'
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { Geolocation } from '@capacitor/geolocation'; 

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

  constructor(private ticketmasterAPIService: TicketmasterService, 
              private firestore: AngularFirestore,  
              private route: ActivatedRoute) {}

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  ngOnInit() {
    this.getUserLocationAndLoadEvents();

    // uid
    const user = this.utilsService.getFromLocalStorage('user'); 
    if (user && user.uid) {
      this.userId = user.uid;
    } else {
      console.error('User ID is not available');
    }
  }

  // Get user's current location and load events based on that location
  async getUserLocationAndLoadEvents() {
    try {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      // Get the current position using Capacitor Geolocation
      const position = await Geolocation.getCurrentPosition();

      const lat = position.coords.latitude; // 40.54579798486183
      const lng = position.coords.longitude; // -3.7004399308207847

      console.log('Current position:', lat, lng);

      // Load events w user's current location
      await this.loadEventsByLatLong(lat, lng);
      await loading.dismiss();
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  }

  async loadEventsByLatLong(lat: number, lng: number) {
    try {
      console.log(`Fetching events near: lat=${lat}, lng=${lng}`);
  
      // Check if the coordinates are within Puerto Rico's range
      const isPuertoRico = lat >= 17.9 && lat <= 18.5 && lng >= -67.3 && lng <= -65.2;
  
      if (isPuertoRico) {
        console.log('User is in Puerto Rico. Fetching events from Firebase.');
        this.evento = await this.getEventsFromFirebase();
      } else {
        console.log('User is NOT in Puerto Rico. Fetching events from Ticketmaster.');
        this.evento = await this.ticketmasterAPIService.getEventsByLocation(lat, lng);
      }
  
      this.filteredEvents = this.events;
  
      // If no events are found, show a "No events available" message
      if (!this.filteredEvents || this.filteredEvents.length === 0) {
        console.log('No events available in this area.');
        // this.filteredEvents = [{ name: 'No events available in your area', img: 'default-placeholder.png' }];
      }
  
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }  

  // TODO: RENAME TO PR
  async getEventsFromFirebase() {
    try {
      const snapshot = await this.firestore.collection('eventsPuertoRico').get().toPromise();
      return snapshot?.docs.map(doc => doc.data()) || [];
    } catch (error) {
      console.error('Error fetching events from Firebase:', error);
      return [];
    }
  }

  searchZipCode: string = ''; // Stores the zip code input
  selectedDate: string = '';  // Stores the selected date

  async fetchEvents() {
    try {
      const loading = await this.utilsService.loading(); 
      await loading.present();
  
      if (this.searchTerm.trim() !== '') {
        // Fetch events by keyword
        this.evento = await this.ticketmasterAPIService.getEventsByKeyword(this.searchTerm);
      } else if (this.searchZipCode) {
        // Fetch events by postal code
        this.evento = await this.ticketmasterAPIService.getEventsByPostalCode(this.searchZipCode);
      } else {
        // Default: Fetch events by location
        const position = await Geolocation.getCurrentPosition();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.evento = await this.ticketmasterAPIService.getEventsByLocation(lat, lng);
      }
  
      this.filteredEvents = this.evento;
      await loading.dismiss();
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }
  
  // Optional: Auto-trigger search when typing
  onSearchInput(event: any) {
    if (event.detail.value.trim() === '') {
      this.fetchEvents(); // Reset search if input is empty
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
          duration: 1500,
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      })
      .catch((error) => {
        this.utilsService.presentToast({
          message: 'Error adding event: ' + error.message,
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

  signOut() {
    this.firebaseService.signout();
  }

}