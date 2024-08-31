import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})

export class TicketmasterService {
  
  constructor() {}

  async getEventsByPostalCode(postalCode: string): Promise<Event[]> {
    try {
      const params = new URLSearchParams({
        apikey: 'KH4JBr532TZLq5DGdEdHB3EAtlTcHuSA',
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
        apikey: 'KH4JBr532TZLq5DGdEdHB3EAtlTcHuSA',
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
        apikey: 'KH4JBr532TZLq5DGdEdHB3EAtlTcHuSA',
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
        apikey: 'KH4JBr532TZLq5DGdEdHB3EAtlTcHuSA',
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
  
}
