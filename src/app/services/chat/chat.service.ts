import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, from } from 'rxjs';
import { FirebaseService } from '../firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  currentUserId: string;
  public users: Observable<any>;
  public chatRooms: Observable<any>;
  public selectedChatRoomMessages: Observable<any>;

  constructor(
    private firebase: FirebaseService,
  ) { 
    this.getId();
  }

  /// Initial
  getId() {
    console.log(this.currentUserId);
    this.currentUserId = this.firebase.getId();
  }

  getUsers1() {
    this.users = this.firebase.collectionDataQuery(
      'users', 
      this.firebase.whereQuery('uid', '!=', this.currentUserId)
    );
  }

  async createChatRoom(user_id) {
    try {
      // check for existing chatroom
      let room: any;
      const querySnapshot = await this.firebase.getDocs(
        'chatRooms',
        this.firebase.whereQuery(
          'members', 
          'in', 
          [[user_id, this.currentUserId], [this.currentUserId, user_id]]
        )
      );
      room = await querySnapshot.docs.map((doc: any) => {
        let item = doc.data();
        item.id = doc.id;
        return item;
      });
      console.log('exist docs: ', room);
      if(room?.length > 0) return room[0];
      const data = {
        members: [
          this.currentUserId,
          user_id
        ],
        type: 'private',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      room = await this.firebase.addDocument('chatRooms', data);
      return room;
    } catch(e) {
      throw(e);
    }
  }

  getChatRooms1() {
    this.getId();
    console.log(this.currentUserId);
    this.chatRooms = this.firebase.collectionDataQuery(
      'chatRooms', 
      this.firebase.whereQuery('members', 'array-contains', this.currentUserId)
    ).pipe(
      map((data: any[]) => {
        console.log('room data: ', data);
        data.map((element) => {
          const user_data = element.members.filter(x => x != this.currentUserId);
          console.log(user_data);
          const user = this.firebase.docDataQuery(`users/${user_data[0]}`, true);
          // const user: any = this.firebase.getDocById(`users/${user_data[0]}`);
          element.user = user;
        });
        return (data);
      }),
      switchMap(data => {
        return of(data);
      })
    );
  }

  getChatRoomMessages(chatRoomId) {
    this.selectedChatRoomMessages = this.firebase.collectionDataQuery(
      `chats/${chatRoomId}/messages`, 
      this.firebase.orderByQuery('createdAt', 'desc')
    )
    .pipe(map((arr: any) => arr.reverse()));
  }

  async sendMessage(chatId, msg) {
    try {
      const new_message = {
        message: msg,
        sender: this.currentUserId,
        createdAt: new Date()
      };
      console.log(chatId);
      if(chatId) {
        await this.firebase.addDocument(`chats/${chatId}/messages`, new_message);
      }
    } catch(e) {
      throw(e);
    }
  }

  /// Update
  getUsers() {
    this.users = this.firebase.docDataQuery(`users/${this.currentUserId}`, true).pipe(
      map((userData: any) => {
        const matches = userData.matches || []; 
        console.log('Matched users: ', matches);
        return matches;
      })
    );
  }  

  getMatchedUsers(): Observable<any[]> {
    this.getId();
  
    if (!this.currentUserId) {
      console.error("Current user ID is not set");
      return of([]); 
    }
  
    return this.firebase.docDataQuery(`users/${this.currentUserId}`, true).pipe(
      map((userData: any) => {
        const matchedUserIds = userData.matches || []; 
  
        return matchedUserIds;
      })
    );
  }

  getChatRooms() {
    this.getId(); 
  
    if (!this.currentUserId) {
      console.error("Current user ID is not set");
      return;
    }
  
    this.chatRooms = this.getMatchedUsers().pipe(
      switchMap((matchedUserIds: any[]) => {
        console.log('Matched users:', matchedUserIds);
  
        // Ensure a chat room exists for each matched user
        const roomPromises = matchedUserIds.map(userId => 
          this.ensureChatRoomExists(userId) // Ensure chat room exists for each match
        );
  
        return from(Promise.all(roomPromises));
      }),
      map((rooms: any[]) => {
        rooms.map((element) => {
          const user_data = element.members.filter(x => x != this.currentUserId);
          const user = this.firebase.docDataQuery(`users/${user_data[0]}`, true);
          element.user = user; 
        });
        console.log('Chat rooms:', rooms);
        return rooms;
      })
    );
  }

  async ensureChatRoomExists(user_id) {
    try {
      let room: any;
      const querySnapshot = await this.firebase.getDocs(
        'chatRooms',
        this.firebase.whereQuery(
          'members', 
          'in', 
          [[user_id, this.currentUserId], [this.currentUserId, user_id]]
        )
      );
      room = await querySnapshot.docs.map((doc: any) => {
        let item = doc.data();
        item.id = doc.id;
        return item;
      });

      // If chat room exists, return it
      if (room?.length > 0) {
        return room[0];
      }

      // If no chat room exists, create a new one
      const data = {
        members: [
          this.currentUserId,
          user_id
        ],
        type: 'private',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      room = await this.firebase.addDocument('chatRooms', data);
      return room;

    } catch (e) {
      throw(e);
    }
  }

}
