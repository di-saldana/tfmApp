import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TicketmasterService {

  private readonly APIKEY = 'KH4JBr532TZLq5DGdEdHB3EAtlTcHuSA';
  private readonly BASEURL = 'https://app.ticketmaster.com/discovery/v2/events';
  
  constructor(private http: HttpClient) {}

  async getEventsByPostalCode(postalCode: string): Promise<Event[]> {
    try {
      const params = new URLSearchParams({
        apikey: this.APIKEY,
        postalCode: postalCode,
        locale: '*'
      });
  
      const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events', { params });
      const events: Event[] = response.data._embedded.events;
  
      // Filter events where Classification > Segment > Name is 'Music'
      const filteredEvents = events.filter(event => 
        event['classifications'] && event['classifications'].some(classification => 
          classification.segment && classification.segment.name === 'Music'
        )
      );
  
      return filteredEvents;
    } catch (error) {
      console.error('Error fetching events by postal code:', error);
      throw error;
    }
  }

  // TODO: Show error message if search doesn't exists
  async getEventsByArtist(artistName: string): Promise<Event[]> {
    try {
      const params = new URLSearchParams({
        apikey: this.APIKEY, 
        keyword: artistName,
        locale: '*'
      });
  
      const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events', { params });
      const events: Event[] = response.data._embedded.events;
  
      // Filter events where Classification > Segment > Name is 'Music'
      const filteredEvents = events.filter(event => 
        event['classifications'] && event['classifications'].some(classification => 
          classification.segment && classification.segment.name === 'Music'
        )
      );
  
      return filteredEvents;
    } catch (error) {
      console.error('Error fetching events by artist name:', error);
      throw error;
    }
  }  
  
  async getEventsByVenue(venueId: string): Promise<Event[]> {
    try {
      const params = new URLSearchParams({
        apikey: this.APIKEY, 
        venueId: venueId,
        locale: '*'
      });
  
      const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events', { params });
      const events: Event[] = response.data._embedded.events;
  
      // Filter events where Classification > Segment > Name is 'Music'
      const filteredEvents = events.filter(event => 
        event['classifications'] && event['classifications'].some(classification => 
          classification.segment && classification.segment.name === 'Music'
        )
      );
  
      return filteredEvents;
    } catch (error) {
      console.error('Error fetching events by venue:', error);
      throw error;
    }
  }
  
  async getEventsByCountry(countryCode: string): Promise<Event[]> {
    try {
      const params = new URLSearchParams({
        apikey: this.APIKEY, 
        countryCode: countryCode,
        locale: '*'
      });
  
      const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events', { params });
      const events: Event[] = response.data._embedded.events;
  
      // Filter events where Classification > Segment > Name is 'Music'
      const filteredEvents = events.filter(event => 
        event['classifications'] && event['classifications'].some(classification => 
          classification.segment && classification.segment.name === 'Music'
        )
      );
  
      return filteredEvents;
    } catch (error) {
      console.error('Error fetching events by country code:', error);
      throw error;
    }
  }
  
  getEventsByGeoPoint(lat: number, lng: number, radius: number): Promise<any> {
    const url = `${this.BASEURL}/events?geoPoint=${this.encodeGeoPoint(lat, lng)}&radius=${radius}&unit=miles&apikey=${this.APIKEY}`;
    return this.http.get(url).toPromise();
  }
  
  encodeGeoPoint(lat: number, lng: number): string {
    return btoa(`${lat},${lng}`);
  }

  async getEventsByLocation(lat: number, lng: number): Promise<Event[]> {
    try {
      const params = new URLSearchParams({
        apikey: this.APIKEY,
        latlong: `${lat},${lng}`,
        radius: '100', // millas
        locale: '*'
      });
  
      const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events', { params });
      
      const events: Event[] = response.data._embedded.events;
  
      // Filter events where Classification > Segment > Name is 'Music'
      const filteredEvents = events.filter(event => 
        event['classifications'] && event['classifications'].some(classification => 
          classification.segment && classification.segment.name === 'Music'
        )
      );
  
      return filteredEvents;
    } catch (error) {
      console.error('Error fetching events by location:', error);
      throw error;
    }
  }

}
