import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../api/spotify/spotify.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit() {
    this.spotifyService.onPageLoad();
  }

  requestAuthorization(): void {
    const clientId = "63e107aee6b549d980b4075dcd9a93f2" 
    const clientSecret = "6a0b6804cd0448c8ad35fb1da92925e3" 
    this.spotifyService.requestAuthorization(clientId, clientSecret);
  }

  fetchTracks(): void {
    this.spotifyService.fetchTracks();
  }

  play(): void {
    this.spotifyService.play();
  }

  shuffle(): void {
    this.spotifyService.shuffle();
  }

  pause(): void {
    this.spotifyService.pause();
  }

  next(): void {
    this.spotifyService.next();
  }

  previous(): void {
    this.spotifyService.previous();
  }

  transfer(): void {
    this.spotifyService.transfer();
  }
}
