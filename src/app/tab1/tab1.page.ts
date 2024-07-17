import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketmasterService } from '../api/ticketmaster/ticketmaster.service'
import { from } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  evento: any; 

  constructor(private activatedRoute: ActivatedRoute, private ticketmasterAPIService: TicketmasterService) {}

  ngOnInit() {
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

}