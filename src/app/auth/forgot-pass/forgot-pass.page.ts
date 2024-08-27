import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../models/user.model';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.page.html',
  styleUrls: ['./forgot-pass.page.scss'],
})
export class ForgotPassPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  })

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      this.firebaseService.sendRecoveryEmail(this.form.value.email).then(res => {
        this.utilsService.presentToast({
          message: "Your request was succesful.",
          duration: 1500,
          position: 'top',
          icon: 'mail-outline'
        });
        this.utilsService.routerLink('/auth');
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
}

