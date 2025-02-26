import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class TicketmasterService {
  private readonly APIKEY = 'KH4JBr532TZLq5DGdEdHB3EAtlTcHuSA';
  private readonly BASEURL = 'https://app.ticketmaster.com/discovery/v2/events';
  
  constructor(private http: HttpClient) {}

  private async fetchAllEvents(params: URLSearchParams): Promise<Event[]> {
    let allEvents: Event[] = [];
    let page = 0;
    let totalPages = 1;

    do {
      params.set('page', page.toString());
      params.set('size', '20');

      const response = await axios.get(this.BASEURL, { params });

      if (response.data._embedded?.events) {
        allEvents = [...allEvents, ...response.data._embedded.events];
      }

      totalPages = response.data.page.totalPages;
      page++;
    } while (page < totalPages);

    return allEvents.filter(event => 
      event['classifications']?.some(classification => 
        classification.segment?.name === 'Music'
      )
    );
  }

  async getEventsByPostalCode(postalCode: string): Promise<Event[]> {
    const params = new URLSearchParams({ apikey: this.APIKEY, postalCode, locale: '*' });
    return this.fetchAllEvents(params);
  }

  async getEventsByArtist(artistName: string): Promise<Event[]> {
    const params = new URLSearchParams({ apikey: this.APIKEY, keyword: artistName, locale: '*' });
    return this.fetchAllEvents(params);
  }

  async getEventsByVenue(venueId: string): Promise<Event[]> {
    const params = new URLSearchParams({ apikey: this.APIKEY, venueId, locale: '*' });
    return this.fetchAllEvents(params);
  }

  async getEventsByCountry(countryCode: string): Promise<Event[]> {
    const params = new URLSearchParams({ apikey: this.APIKEY, countryCode, locale: '*' });
    return this.fetchAllEvents(params);
  }

  async getEventsByLocation(lat: number, lng: number): Promise<Event[]> {
    const params = new URLSearchParams({
      apikey: this.APIKEY,
      latlong: `${lat},${lng}`,
      radius: '100',
      locale: '*'
    });
    return this.fetchAllEvents(params);
  }

  async getEventsByKeyword(keyword: string): Promise<Event[]> {
    const params = new URLSearchParams({ apikey: this.APIKEY, keyword });
    return this.fetchAllEvents(params);
  }
}
