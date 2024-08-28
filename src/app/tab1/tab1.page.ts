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
  }

  addEvent(event: any) {
    this.firestore.collection('event').add(event).then(() => {
      console.log('Event added successfully');
    }).catch(error => {
      console.error('Error adding user: ', error);
    });
  }

  signOut() {
    this.firebaseService.signout();
  }

}