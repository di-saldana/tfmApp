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
    localStorage.setItem('isAuthenticated', 'false');
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

  // Function to get saved_events
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

  // Add an invite from user1 to user2 (as part of user1's document)
  async addInvite(userId1: string, userId2: string): Promise<void> {
    const userDocRef = doc(getFirestore(), `users/${userId1}`);
    
    // Use arrayUnion to add userId2 to the 'invites' field
    try {
      await updateDoc(userDocRef, {
        invites: arrayUnion(userId2) // This will add userId2 to the array of invites
      });
      console.log(`Invite from ${userId1} to ${userId2} added successfully.`);
    } catch (error) {
      console.error(`Error adding invite: ${error.message}`, error);
      throw error;
    }
  }

  async checkForInvite(userId2: string, userId1: string): Promise<boolean> {
    const userDocRef = doc(getFirestore(), `users/${userId2}`);
  
    return getDoc(userDocRef).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const invites = docSnapshot.data()?.['invites'] || [];
        const inviteExists = invites.includes(userId1);
        console.log(`Invite from ${userId2} to ${userId1} exists: ${inviteExists}`);
        return inviteExists;
      } else {
        console.log(`User document for ${userId2} does not exist.`);
        return false;
      }
    }).catch((error) => {
      console.error(`Error checking for invite: ${error.message}`, error);
      throw error;
    });
  }

  // Add a match for both users
  async addMatch(userId1: string, userId2: string): Promise<void> {
    const user1DocRef = doc(getFirestore(), `users/${userId1}`);
    const user2DocRef = doc(getFirestore(), `users/${userId2}`);

    // Use arrayUnion to add each user to the other's matches field
    return Promise.all([
      updateDoc(user1DocRef, {
        matches: arrayUnion(userId2) // Add userId2 to user1's matches array
      }),
      updateDoc(user2DocRef, {
        matches: arrayUnion(userId1) // Add userId1 to user2's matches array
      })
    ])
    .then(() => {
      console.log(`Match between ${userId1} and ${userId2} added successfully.`);
    })
    .catch((error) => {
      console.error(`Error adding match: ${error.message}`, error);
      throw error;
    });
  }

  // Autenticacion con Spotify
  async signinWithSpotify(email: string) {
    // TODO: Check si hay un spotify_id relacionado, sino, link accounts
    // await this.updateUserSpotifyInfo(uid, email, spotifyId, name, image);

    return signInWithEmailAndPassword(getAuth(), email, '123456'); // randomPassword); // Hardcoded just for troubleshooting
  }

  async checkIfEmailExists(email: string): Promise<boolean> {
    const userRef = this.firestore.collection('users');
    const querySnapshot = await userRef.ref.where('email', '==', email).get();
  
    // If any documents are returned, the email exists
    return !querySnapshot.empty;
  }

  async authenticateWithSpotify(email: string): Promise<void> {
    try {
      console.log("Starting Spotify authentication for email: ", email);
  
      // Step 1: Retrieve Spotify user profile
      // TODO: CHECK
      // const user = await this.spotify.getProfile();
      // if (!user) {
      //   throw new Error('Failed to retrieve Spotify profile');
      // }
      // console.log("Spotify profile retrieved:", user);
  
      // Step 2: Extract user details from Spotify profile
      // const spotifyId = (await user).spotifyID
      // const name = (await user).displayName
      // const image = (await user).profileImage
      const spotifyId = "22oaxkt4bvq5mflg34r75qc6i";
      const name = "Dianelys Saldaña"; 
      const image = "https://i.scdn.co/image/ab67757000003b82a4beffa6b43be7021b699691"; 
  
      /*
      "displayName":"Dianelys Saldaña",
      "email":"dianelyssaldana5@gmail.com",
      "spotifyID":"22oaxkt4bvq5mflg34r75qc6i",
      "country":"ES",
      "profileImage":"https://i.scdn.co/image/ab67757000003b82a4beffa6b43be7021b699691",
      "followersCount":15
      */
  
      // Step 3: Generate a random password for Firebase authentication
      const randomPassword = Math.random().toString(36).slice(-8);
      // console.log("Random password generated for Firebase:", randomPassword);
  
      // Step 4: Create Firebase user with email and generated random password
      const authResult = await createUserWithEmailAndPassword(getAuth(), email, '123456'); // randomPassword); // Hardcoded just for troubleshooting
      localStorage.setItem('isAuthenticated', 'true');

      // Step 5: Get UID of newly created user
      const uid = authResult.user.uid; 
      if (!uid) {
        throw new Error('Failed to retrieve user ID from Firebase');
      }
      console.log("Firebase user ID retrieved:", uid);

      // Step 6: Update user information in Firebase with Spotify data
      await this.setUserInfo(uid, email, name, spotifyId, image);
      await this.updateUserSpotifyInfo(uid, email, spotifyId, name, image);
      console.log("Firebase user information updated with Spotify data");
  
    } catch (error) {
      console.error('Error authenticating with Spotify:', error.message, error);
      throw error; 
    }
  }  

  async updateUserSpotifyInfo(uid: string, email: string, spotifyId: string, name: string, image: string, age?: string): Promise<void> {
    const path = `users/${uid}`;
  
    const updatedData = {
      uid: uid || '',
      spotify_id: spotifyId || '',
      name: name || '',
      email: email || '',
      profile_picture: image || '',
      saved_events: [] = [],
      invites: [] = [],
      matches: [] = [],
      age: age || '',
    };
  
    try {
      await this.setDocument(path, updatedData);
      console.log('User profile updated with Spotify info:', updatedData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async setUserInfo(uid: string, email: string, name: string, spotifyId: string, image: string, age?: string): Promise<void> {
    const userInfo = {
      uid: uid || '',
      spotify_id: spotifyId || '',
      name: name || '',
      email: email || '',
      profile_picture: image || '',
      saved_events: [] = [],
      invites: [] = [],
      matches: [] = [],
      age: age || '',
    };
  
    const path = `users/${uid}`;
  
    try {
      // Set the document in Firestore
      await this.setDocument(path, userInfo);
  
      // Save to local storage and navigate
      this.utilService.saveInLocalStorage('user', userInfo);
      this.utilService.routerLink('/tabs/tab1');
    } catch (error) {
      console.error('Error setting user info:', error);
  
      // Show error toast
      this.utilService.presentToast({
        message: error.message,
        duration: 2500,
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } 
  }

  // Function to retrieve user ID given an email
  async getUserIdByEmail(email: string): Promise<string> {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    
    // Query to find the document with the matching email
    const q = query(usersRef, where('email', '==', email));
    
    try {
      const querySnapshot = await getDocs(q);
      
      // Check if any documents are returned
      if (querySnapshot.empty) {
        return ''; // No user found with the given email
      }

      // Assuming there is only one document with the given email
      const userDoc = querySnapshot.docs[0];
      return userDoc.id; // Return the user ID
    } catch (error) {
      console.error('Error fetching user ID by email:', error);
      return ''; // Return an empty string in case of an error
    }
  }

}