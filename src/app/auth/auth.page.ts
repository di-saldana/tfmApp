import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]), 
    password: new FormControl('', [Validators.required]) 
  })

  firebaseService = inject(FirebaseService);

  utilsService = inject(UtilsService)

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      this.firebaseService.signin(this.form.value as User).then(res => {
        console.log(res);
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

}
