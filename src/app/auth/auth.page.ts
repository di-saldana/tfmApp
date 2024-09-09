import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';
import { SpotifyService } from '../api/spotify/spotify.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  userAuthenticated: boolean = false;

  constructor(private spotifyService: SpotifyService, private route: ActivatedRoute) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]), 
    password: new FormControl('', [Validators.required]) 
  })

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  ngOnInit() {
    // TODO: DELETE
    // this.route.queryParams.subscribe(async (params) => {
    //   console.log(params);
    //   await this.spotifyService.onPageLoad();
    // });
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      this.firebaseService.signin(this.form.value as User).then(res => {
        // console.log(res);
        this.getUserInfo(res.user.uid);
        this.utilsService.routerLink('/tabs'); 
        this.form.reset();
      }).catch(error => {
        console.log(error);

        this.utilsService.presentToast({
          message: error.message,
          duration: 2500,
          position: 'middle',
          icon: 'alert-circle-outline'
        })
      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      let path = `users/${uid}`;

      this.firebaseService.getDocument(path).then((user: User) => {
        this.utilsService.saveInLocalStorage('user', user)
        this.utilsService.routerLink('/tabs'); 
        this.form.reset();

        this.utilsService.presentToast({
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
  }
  
  // Spotify Authentication
  async onAuthClick() {
    try {
      // Start the Spotify authorization flow
      await this.spotifyService.requestAuthorization();
      
      // TODO:
      // After successful authorization, handle Spotify login with Firebase
      
      // If login is successful, navigate events
      // this.utilsService.routerLink('/tabs/tab1');
    } catch (error) {
      console.error('Error during Spotify authentication:', error);

      this.utilsService.presentToast({
        message: error.message || 'Spotify login failed',
        duration: 2500,
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }
  }

  // Función para desconectar al usuario de Spotify
  deleteAuth() {
    localStorage.clear();
    window.location.reload();
  }

}