import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, updateDoc, arrayUnion, collection, getDocs, query, where, collectionData, Timestamp } from '@angular/fire/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { UtilsService } from './utils.service';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { SpotifyService } from '../api/spotify/spotify.service'; 
import { all } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  getUserEvents(userId: string) {
    throw new Error('Method not implemented.');
  }

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilService = inject(UtilsService);

  // constructor(private firestore: AngularFirestore) {}
  constructor(private spotifyService: SpotifyService) { }

  // Autenticacion con Spotify
  async authenticateWithSpotify(email: string): Promise<void> {
    const randomPassword = Math.random().toString(36).slice(-8); // Generate a random password
    await createUserWithEmailAndPassword(getAuth(), email, randomPassword);
  }

  async handleSpotifyLogin() {
    const user = await this.spotifyService.getSpotifyUser(); 
    await this.authenticateWithSpotify(user['email']); // user.email
  }

  getAuth() {
    return getAuth();
  }

  // Autenticacion normal
  signin(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  signout() {
    getAuth().signOut();
    localStorage.removeItem('user');
    sessionStorage.removeItem('user'); 
    this.utilService.routerLink('/auth');
  }

  signup(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  // Base de Datos
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // Eventos
  // TODO: Guardar evento por su id unico, para diferenciar de distintos eventos de un mismo artista
  addEventToUser(userId: string, eventId: string) {
    if (!userId) {
      throw new Error('User ID is missing');
    }
    
    const userDocRef = doc(getFirestore(), `users/${userId}`);

    return updateDoc(userDocRef, {
      saved_events: arrayUnion(eventId)
    });
  }

  // Invites
  addInviteToUser(userIdA: string, userIdB: string, eventId: string) {
    if (!userIdA) {
      throw new Error('User ID is missing');
    }
    
    const userDocRef = doc(getFirestore(), `users/${userIdA}`);

    return updateDoc(userDocRef, {
      invites: arrayUnion(userIdB)
    });
  }

  // Method to get saved_events
  getSavedEvents(uid: string): Observable<any[]> {
    return this.firestore.collection('users').doc(uid).valueChanges().pipe(
      map(userData => {
        if (userData) {
          return userData['saved_events'] || []; 
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching user data:', error);
        return throwError(() => new Error('Error fetching user data'));
      })
    );
  }

  // Function to get users interested in a specific event
  async getUsersByEvent(event_name: string, ownerUid: string): Promise<any[]> {
    if (!event_name) {
      throw new Error('Event name is missing');
    }

    const db = getFirestore();
    const usersRef = collection(db, 'users');
    
    // Query to find users with the event_name in their saved_events array
    const q = query(usersRef, where('saved_events', 'array-contains', event_name));
    
    const querySnapshot = await getDocs(q);

    // Extract user data from query results
    const interestedUsers: any[] = [];
    // querySnapshot.forEach((doc) => {
    //   const userData = doc.data();
    //   interestedUsers.push(userData);
    // });
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData['uid'] !== ownerUid) {  // Filter out the owner
        interestedUsers.push(userData);
      }
    });

    return interestedUsers;
  }

  // Function to get all users except the current user (owner)
  async getAllUsers1(ownerUid: string): Promise<any[]> {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    
    // Query to get all users from the 'users' collection
    const q = query(usersRef);
    
    const querySnapshot = await getDocs(q);

    // Array to store all users except the current one
    const allUsers: any[] = [];
    console.log(allUsers);

    // Loop through all user documents
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      
      // Filter out the current user by checking their uid
      if (userData['uid'] !== ownerUid) {
        allUsers.push(userData);
      }
    });

    return allUsers;
  }

  async getAllUsers(ownerUid: string): Promise<any[]> {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
  
    const allUsers: any[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData['uid'] !== ownerUid) {
        allUsers.push(userData);
      }
    });
  
    return allUsers;
  }
  

  getUsers(): Observable<any[]> {
    return this.firestore.collection('users').valueChanges().pipe(
      map(users => {
        if (users) {
          return users; // Returns all users
        } else {
          return []; // Returns an empty array if no users found
        }
      }),
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Error fetching users'));
      })
    );
  }

  // Returns id of current user
  getId(): string | null {
    const user = getAuth().currentUser;
    return user ? user.uid : null;
  }

  collectionRef(path) {
    const firestore = getFirestore();
    return collection(firestore, path);
  }

  collectionDataQuery(path, queryFn?) {
    let dataRef: any = this.collectionRef(path);
    if(queryFn) {
      const q  = query(dataRef, queryFn);
      dataRef = q;
    }

    const collection_data = collectionData<any>(dataRef);
    return collection_data;
  }

  whereQuery(fieldPath, condition, value) {
    return where(fieldPath, condition, value);
  }  

  // Messages
  async sendMessage(senderId: string, recipientId: string, content: string) {
    const db = getFirestore();

    // Generate a unique chatRoomId using both userIds (could also use a unique roomId for group chats)
    const chatRoomId = this.generateChatRoomId(senderId, recipientId);

    // Create a reference to the chat room and messages collection
    const messageRef = doc(db, `messages/${chatRoomId}/messages/${this.generateMessageId()}`);


    // Prepare the message data
    const messageData = {
      senderId,
      recipientId,
      content,
      timestamp: Timestamp.now(),
      isRead: false
    };

    // Add the message to the messages collection
    await setDoc(messageRef, messageData);
  }

  // Generate a consistent chatRoomId based on user IDs (for direct messages)
  generateChatRoomId(userIdA: string, userIdB: string): string {
    // Sort the IDs to ensure consistent ordering (so both users get the same chatRoomId)
    const sortedIds = [userIdA, userIdB].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

  // Generate a unique messageId (could use auto-generated IDs as well)
  generateMessageId(): string {
    return Math.random().toString(36).substr(2, 9); // Random message ID
  }

}