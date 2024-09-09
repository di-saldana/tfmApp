import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, updateDoc, arrayUnion, collection, getDocs, query, where } from '@angular/fire/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { UtilsService } from './utils.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { SpotifyService } from '../api/spotify/spotify.service'; 

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  spotify = inject(SpotifyService);
  utilService = inject(UtilsService);

  getAuth() {
    return getAuth();
  }

  // Autenticacion normal con Firebase
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

  // Base de Datos Firestore
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

  // Autenticacion con Spotify
  // TODO: Modify to add: email, name, spotify id, random password when creating new user
  async authenticateWithSpotify(email: string): Promise<void> {
    const randomPassword = Math.random().toString(36).slice(-8); // Generate a random password
    await createUserWithEmailAndPassword(getAuth(), email, randomPassword);
  }

  async handleSpotifyLogin() {
    console.log("Handle Spotify Login Flow")
    /*
    TODO: Flow for when a user authenticates with Spotify:

      - Retrieve email from profile info with spotify.getProfile() method
      - Check if email is registered already:
        - If it is registered:
          - Retrieve Spotify ID from profile
          - updateUser() with the spotify id
          - navigate home ('tabs/tab1')
        - If user is not registered
          - authenticateWithSpotify()
          - navigate home ('tabs/tab1')
    */
  }
 
}