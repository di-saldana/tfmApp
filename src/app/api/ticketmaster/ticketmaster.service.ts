import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})

export class TicketmasterService {
  
  constructor() {}

  async getEventsByPostalCode(postalCode: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({ 
        apikey: 'KH4JBr532TZLq5DGdEdHB3EAtlTcHuSA', 
        postalCode: postalCode,
        locale: '*'
      });
      const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events', { params });
      return response.data._embedded.events; 
    } catch (error) {
      console.error('Error fetching events by postal code:', error);
      throw error;
    }
  }
  
}



