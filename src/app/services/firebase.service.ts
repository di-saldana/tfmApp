import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, updateDoc, arrayUnion, collection, getDocs, query, where, collectionData, Timestamp, addDoc, docData, Firestore, orderBy, OrderByDirection } from '@angular/fire/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, linkWithCredential } from 'firebase/auth';
import { User } from '../models/user.model';
import { UtilsService } from './utils.service';
import { catchError, from, map, Observable, throwError } from 'rxjs';
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

  // Autenticacion con Spotify
  async signinWithSpotify(email: string) {
    return signInWithEmailAndPassword(getAuth(), email, '123456'); // Hardcoded just for troubleshooting
  }

  async checkIfEmailExists(email: string): Promise<boolean> {
    const userRef = this.firestore.collection('users');
    const querySnapshot = await userRef.ref.where('email', '==', email).get();
  
    // If any documents are returned, the email exists
    return !querySnapshot.empty;
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
      last_fm_id: '', 
      country: '', 
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

  async linkSpotifyToFirebase(email: string, spotifyId: string, name: string, image: string) {
    try {
      const auth = getAuth();
      const emailExists = await this.checkIfEmailExists(email);
      let uid: string;
  
      if (emailExists) {
        // If email exists, sign in using the email and password
        await signInWithEmailAndPassword(auth, email, '123456');
        console.log('User signed in successfully!');
        uid = await this.getUserIdByEmail(email);
  
        // Check if user document exists in Firestore
        const userDocRef = doc(getFirestore(), `users/${uid}`);
        const userDoc = await getDoc(userDocRef);
  
        if (!userDoc.exists()) {
          // If user document does not exist, create a new one
          await setDoc(userDocRef, {
            email,
            name,
            spotifyId,
            profile_picture: image || '',
            uid: uid || '',
            saved_events: [],
            invites: [],
            matches: [],
            age: '',
            last_fm_id: '',
            country: '',
          });
          console.log('User info saved to Firestore successfully!');
          this.getUserInfo(uid);
        } else {
          // User already exists, update necessary fields
          await updateDoc(userDocRef, {
            spotifyId,
            profile_picture: image || '',
            name,
          });
          console.log('User info updated successfully!');
          this.getUserInfo(uid);
        }
  
      } else {
        // If email does not exist, sign up with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, '123456');
        uid = userCredential.user.uid;
        console.log('User signed up and info saved successfully!');
  
        // Set user info in Firestore
        const userDocRef = doc(getFirestore(), `users/${uid}`);
        await setDoc(userDocRef, {
          email,
          name,
          spotifyId,
          profile_picture: image || '',
          uid: uid || '',
          saved_events: [],
          invites: [],
          matches: [],
          age: '',
          last_fm_id: '',
          country: '',
        });
  
        console.log('User info saved to Firestore successfully!');
        this.getUserInfo(uid);
      }
    } catch (error) {
      console.error('Error linking Spotify to Firebase:', error);
    }
  }  

  async getUserInfo(uid: string) {
    const loading = await this.utilService.loading(); 
    await loading.present();

    let path = `users/${uid}`;

    this.getDocument(path).then((user: User) => {
      this.utilService.saveInLocalStorage('user', user)
      this.utilService.routerLink('/tabs'); 
      
      this.utilService.presentToast({
        message: `Welcome Pal, ${user.name}!`,
        duration: 1500,
        position: 'middle',
        icon: 'person-circle-outline'
      })
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      loading.dismiss();
    })
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

  // Function to get profile picutre
  getProfilePicture(uid: string) {
    return this.firestore.collection('users').doc(uid).valueChanges().pipe(
      map(userData => {
        if (userData) {
          return userData['profile_picture'] || ""; 
        } else {
          return "";
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

  // Get Firebase User Profile
  async getUserProfile(userId: string): Promise<User> {
    try {
      const userRef = this.firestore.collection('users').doc(userId);
      const userDoc = await userRef.get().toPromise();
      if (userDoc.exists) {
        return userDoc.data() as User;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Function to retrieve Firebase user ID given an email
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

  // Chat Messages
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

  docRef(path) {
    return doc(getFirestore(), path);
  }

  addDocument(path, data) {
    const dataRef = this.collectionRef(path);
    return addDoc(dataRef, data); //add()
  }

  getDocById(path) {
    const dataRef = this.docRef(path);
    return getDoc(dataRef);
  }

  getDocs(path, queryFn?) {
    let dataRef: any = this.collectionRef(path);
    if(queryFn) {
      const q = query(dataRef, queryFn);
      dataRef = q;
    }
    return getDocs(dataRef); //get()
  }

  docDataQuery(path, id?, queryFn?) {
    let dataRef: any = this.docRef(path);
    if(queryFn) {
      const q = query(dataRef, queryFn);
      dataRef = q;
    }
    let doc_data;
    if(id) doc_data = docData<any>(dataRef, {idField: 'id'});
    else doc_data = docData<any>(dataRef); // valuechanges, for doc use docData
    return doc_data;
  }

  orderByQuery(fieldPath, directionStr: OrderByDirection = 'asc') {
    return orderBy(fieldPath, directionStr);
  }

}