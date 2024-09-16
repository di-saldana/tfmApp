import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  countries: string[] = [  
    '🇦🇫 Afghanistan', '🇦🇱 Albania', '🇩🇿 Algeria', '🇦🇩 Andorra', '🇦🇴 Angola', '🇦🇬 Antigua and Barbuda', '🇦🇷 Argentina', '🇦🇲 Armenia', 
    '🇦🇺 Australia', '🇦🇹 Austria', '🇦🇿 Azerbaijan', '🇧🇸 Bahamas', '🇧🇭 Bahrain', '🇧🇩 Bangladesh', '🇧🇧 Barbados', '🇧🇾 Belarus', 
    '🇧🇪 Belgium', '🇧🇿 Belize', '🇧🇯 Benin', '🇧🇹 Bhutan', '🇧🇴 Bolivia', '🇧🇦 Bosnia and Herzegovina', '🇧🇼 Botswana', '🇧🇷 Brazil', 
    '🇧🇳 Brunei', '🇧🇬 Bulgaria', '🇧🇫 Burkina Faso', '🇧🇮 Burundi', '🇨🇻 Cabo Verde', '🇰🇭 Cambodia', '🇨🇲 Cameroon', '🇨🇦 Canada', 
    '🇨🇫 Central African Republic', '🇹🇩 Chad', '🇨🇱 Chile', '🇨🇳 China', '🇨🇴 Colombia', '🇰🇲 Comoros', 
    '🇨🇩 Democratic Republic of the Congo', '🇨🇬 Republic of the Congo', '🇨🇷 Costa Rica', '🇭🇷 Croatia', '🇨🇺 Cuba', 
    '🇨🇾 Cyprus', '🇨🇿 Czech Republic', '🇩🇰 Denmark', '🇩🇯 Djibouti', '🇩🇲 Dominica', '🇩🇴 Dominican Republic', '🇪🇨 Ecuador', 
    '🇪🇬 Egypt', '🇸🇻 El Salvador', '🇬🇶 Equatorial Guinea', '🇪🇷 Eritrea', '🇪🇪 Estonia', '🇸🇿 Eswatini', '🇪🇹 Ethiopia', 
    '🇫🇯 Fiji', '🇫🇮 Finland', '🇫🇷 France', '🇬🇦 Gabon', '🇬🇲 Gambia', '🇬🇪 Georgia', '🇩🇪 Germany', '🇬🇭 Ghana', 
    '🇬🇷 Greece', '🇬🇩 Grenada', '🇬🇹 Guatemala', '🇬🇳 Guinea', '🇬🇼 Guinea-Bissau', '🇬🇾 Guyana', '🇭🇹 Haiti', '🇭🇳 Honduras', 
    '🇭🇺 Hungary', '🇮🇸 Iceland', '🇮🇳 India', '🇮🇩 Indonesia', '🇮🇷 Iran', '🇮🇶 Iraq', '🇮🇪 Ireland', '🇮🇹 Italy', 
    '🇨🇮 Ivory Coast', '🇯🇲 Jamaica', '🇯🇵 Japan', '🇯🇴 Jordan', '🇰🇿 Kazakhstan', '🇰🇪 Kenya', '🇰🇮 Kiribati', '🇰🇼 Kuwait', 
    '🇰🇬 Kyrgyzstan', '🇱🇦 Laos', '🇱🇻 Latvia', '🇱🇧 Lebanon', '🇱🇸 Lesotho', '🇱🇷 Liberia', '🇱🇾 Libya', '🇱🇮 Liechtenstein', 
    '🇱🇹 Lithuania', '🇱🇺 Luxembourg', '🇲🇬 Madagascar', '🇲🇼 Malawi', '🇲🇾 Malaysia', '🇲🇻 Maldives', '🇲🇱 Mali', '🇲🇹 Malta', 
    '🇲🇭 Marshall Islands', '🇲🇷 Mauritania', '🇲🇺 Mauritius', '🇲🇽 Mexico', '🇫🇲 Micronesia', '🇲🇩 Moldova', '🇲🇨 Monaco', 
    '🇲🇳 Mongolia', '🇲🇪 Montenegro', '🇲🇦 Morocco', '🇲🇿 Mozambique', '🇲🇲 Myanmar', '🇳🇦 Namibia', '🇳🇷 Nauru', '🇳🇵 Nepal', 
    '🇳🇱 Netherlands', '🇳🇿 New Zealand', '🇳🇮 Nicaragua', '🇳🇪 Niger', '🇳🇬 Nigeria', '🇰🇵 North Korea', '🇲🇰 North Macedonia', 
    '🇳🇴 Norway', '🇴🇲 Oman', '🇵🇰 Pakistan', '🇵🇼 Palau', '🇵🇸 Palestine', '🇵🇦 Panama', '🇵🇬 Papua New Guinea', '🇵🇾 Paraguay', 
    '🇵🇪 Peru', '🇵🇭 Philippines', '🇵🇱 Poland', '🇵🇹 Portugal', '🇵🇷 Puerto Rico', '🇶🇦 Qatar', '🇷🇴 Romania', '🇷🇺 Russia', 
    '🇷🇼 Rwanda', '🇰🇳 Saint Kitts and Nevis', '🇱🇨 Saint Lucia', '🇻🇨 Saint Vincent and the Grenadines', '🇼🇸 Samoa', 
    '🇸🇲 San Marino', '🇸🇹 Sao Tome and Principe', '🇸🇦 Saudi Arabia', '🇸🇳 Senegal', '🇷🇸 Serbia', '🇸🇨 Seychelles', 
    '🇸🇱 Sierra Leone', '🇸🇬 Singapore', '🇸🇰 Slovakia', '🇸🇮 Slovenia', '🇸🇧 Solomon Islands', '🇸🇴 Somalia', 
    '🇿🇦 South Africa', '🇰🇷 South Korea', '🇸🇸 South Sudan', '🇪🇸 Spain', '🇱🇰 Sri Lanka', '🇸🇩 Sudan', '🇸🇷 Suriname', 
    '🇸🇪 Sweden', '🇨🇭 Switzerland', '🇸🇾 Syria', '🇹🇼 Taiwan', '🇹🇯 Tajikistan', '🇹🇿 Tanzania', '🇹🇭 Thailand', 
    '🇹🇱 Timor-Leste', '🇹🇬 Togo', '🇹🇴 Tonga', '🇹🇹 Trinidad and Tobago', '🇹🇳 Tunisia', '🇹🇷 Turkey', '🇹🇲 Turkmenistan', 
    '🇹🇻 Tuvalu', '🇺🇬 Uganda', '🇺🇦 Ukraine', '🇦🇪 United Arab Emirates', '🇬🇧 United Kingdom', '🇺🇸 United States', 
    '🇺🇾 Uruguay', '🇺🇿 Uzbekistan', '🇻🇺 Vanuatu', '🇻🇦 Vatican City', '🇻🇪 Venezuela', '🇻🇳 Vietnam', '🇾🇪 Yemen', 
    '🇿🇲 Zambia', '🇿🇼 Zimbabwe'
  ];  

  form = new FormGroup({
    uid: new FormControl(''), 
    email: new FormControl('', [Validators.required, Validators.email]), 
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]), 
    age: new FormControl<number>(null, [Validators.required, Validators.min(18)]),
    country: new FormControl('', [Validators.required]) 
  })

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService)

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      this.firebaseService.signup(this.form.value as User).then(async res => {
        await this.firebaseService.updateUser(this.form.value.name);
        let uid = res.user.uid;
        this.form.controls.uid.setValue(uid);

        this.setUserInfo(uid);
      }).catch(error => {
        console.log(error);

        this.utilsService.presentToast({
          message: error.message,
          duration: 1500,
          position: 'middle',
          icon: 'alert-circle-outline'
        })
      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  async setUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsService.loading(); 
      await loading.present();

      let formValues = { ...this.form.value };
      delete formValues.password;
      let path = `users/${uid}`;

      const userInfo = {
        ...formValues, 
        spotify_id: '', 
        profile_picture: '', 
        last_fm_id: '',
        saved_events: [], 
        invites: [], 
        matches: [],
      };      

      this.firebaseService.setDocument(path, userInfo).then(async res => {
        this.utilsService.saveInLocalStorage('user', userInfo)
        this.utilsService.routerLink('/tabs/tab1');  // auth
        this.form.reset();
      }).catch(error => {
        console.log(error);

        this.utilsService.presentToast({
          message: error.message,
          duration: 1500,
          position: 'middle',
          icon: 'alert-circle-outline'
        })
      }).finally(() => {
        loading.dismiss();
      })
    }
  }
}
