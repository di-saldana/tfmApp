import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor() { }

  firebaseService = inject(FirebaseService);

  ngOnInit() {
  }

  signOut() {
    this.firebaseService.signout();
  }
}
