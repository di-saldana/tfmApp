import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketmasterService } from '../api/ticketmaster/ticketmaster.service'
import { from } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SpotifyService } from '../api/spotify/spotify.service';
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
              private spotifyService: SpotifyService, 
              private route: ActivatedRoute) {}

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);  

  ngOnInit() {
    this.getUserLocationAndLoadEvents();

    // Load initial events by postal code
    // console.log(this.ticketmasterAPIService.getEventsByPostalCode('08038')) // Madrid '28009'

    // const eventsPromise = this.ticketmasterAPIService.getEventsByPostalCode('08038');
    // const eventsObservable = from(eventsPromise);

    // eventsObservable.subscribe(
    //   (result) => {
    //     this.evento = result;
    //   },
    //   (err) => {
    //     console.log(err);
    //   }
    // );

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
      // Get the current position using Capacitor Geolocation
      const position = await Geolocation.getCurrentPosition();

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log('Current position:', lat, lng);

      // Load events w user's current location
      await this.loadEventsByLatLong(lat, lng);
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  }

  // Load events from Ticketmaster API based on user's geoPoint and radius
  async loadEventsByGeoPoint(lat: number, lng: number, radius: number) {
    try {
      console.log(`Fetching events near: lat=${lat}, lng=${lng}, radius=${radius}`);
      
      // Call Ticketmaster API to get events by geoPoint and radius
      this.evento = await this.ticketmasterAPIService.getEventsByGeoPoint(lat, lng, radius);
      this.filteredEvents = this.evento;
      console.log('Events:', this.filteredEvents);
    } catch (error) {
      console.error('Error loading events by geoPoint:', error);
    }
  }

  // Load events from Ticketmaster API based on user's lat and long
  async loadEventsByLatLong(lat: number, lng: number) {
    try {
      console.log(`Fetching events near: lat=${lat}, lng=${lng}`);
      
      // Call Ticketmaster API to get events by geoPoint and radius
      this.evento = await this.ticketmasterAPIService.getEventsByLocation(lat, lng);
      this.filteredEvents = this.evento;
      console.log('Events:', this.filteredEvents);
    } catch (error) {
      console.error('Error loading events by lat long:', error);
    }
  }
  
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