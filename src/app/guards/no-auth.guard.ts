import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

firebaseService = inject(FirebaseService);
utilsService = inject(UtilsService);

canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return new Promise((resolve) => {
      this.firebaseService.getAuth().onAuthStateChanged((auth) => {
        if(!auth) resolve(true); // Allow access if no authentication
        else {
          // this.utilsService.routerLink('/spotify-button'); // /tabs/tab1
          // resolve(false);

          const spotifyToken = localStorage.getItem('spotify_token');
          console.log("Spotify Token: " + spotifyToken);
          if (!spotifyToken) {
            this.utilsService.routerLink('/spotify-button'); // Redirect to Spotify authentication
          } else {
            this.utilsService.routerLink('/tabs/tab1'); // Redirect to main app
          }
          resolve(false); // Prevent access to the requested route
    
        }
      })
    });
}

}

