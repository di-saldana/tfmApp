import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatService } from '../services/chat/chat.service';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  users = [
    { id: 1, name: "Lola", photo: "https://i.pravatar.cc/315" }, 
    { id: 2, name: "Lolo", photo: "https://i.pravatar.cc/325" }, 
  ];
  chats = [
    {id: 1, sender: 1, message: 'hi'},
    {id: 2, sender: 2, message: 'hi there!'},
  ];
  name: string = 'Sender';
  // message: string;
  // isLoading = false;
  // currentUserId = 1;

  currentUserId: string = 'TUjdQy6JfdXy0hPuApwKuSzyeFm1';  // Use your actual logic to get the current user ID
  recipientId: string = 'XezGAxDX4GfUe6WhrMveE81O5dz2';  // ID of the recipient user
  message: string = '';  // Message to send
  isLoading = false;  // To show spinner when sending

  constructor(private firebaseService: FirebaseService, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  startChat(item) {

  }

  // Method to send a message
  async sendMessage() {
    if (!this.message.trim()) {
      // Don't send empty messages
      return;
    }

    this.isLoading = true;

    try {
      console.log(this.currentUserId, this.recipientId, this.message);
      await this.firebaseService.sendMessage(this.currentUserId, this.recipientId, this.message);
      this.message = '';  // Clear the message input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.isLoading = false;
    }
  }

}
