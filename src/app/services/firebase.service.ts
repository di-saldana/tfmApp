import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, updateDoc, arrayUnion, collection, getDocs, query, where, collectionData, Timestamp } from '@angular/fire/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { UtilsService } from './utils.service';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { SpotifyService } from '../api/spotify/spotify.service'; 
import { all } from 'axios';

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