import { Injectable } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  currentUserId: string;
  public users: Observable<any>;

  // constructor(public auth: FirebaseService) {
  //   this.getId();
  // }

  constructor(private data: AngularFireDatabase, public auth: FirebaseService) {
    this.auth.getAuth().onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid; // Ensure user is set correctly
      }
    });
  }
  

  getId() {
    this.currentUserId = this.auth.getId();
  }

  // getUsers() {
  //   this.users = this.auth.collectionDataQuery(
  //     'users',
  //     this.auth.whereQuery('uid', '!=', this.currentUserId)      
  //   ); 
  // }

  getUsers(): Observable<any[]> {
    // Return the observable from FirebaseService's collectionDataQuery method
    // return this.auth.collectionDataQuery(
    //   'users',
    //   this.auth.whereQuery('uid', '!=', this.currentUserId)
    // );
    return this.auth.getUsers();
  }

  // TEST
  getMessage(): Observable<any> {
    return this.data.list('message').valueChanges();
  }

  sendMessage(message: string) {
    const user = "Test"; // this.getUser();
    if(user){
    this.data.list('message').push({
      user: user,
      message: message,
      timestamp: Date.now()
    });
    
  }else{
    console.error('Nombre de usuario no definido');
  }
  }
}
