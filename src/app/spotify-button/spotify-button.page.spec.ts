import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyButtonPage } from './spotify-button.page';

describe('SpotifyButtonPage', () => {
  let component: SpotifyButtonPage;
  let fixture: ComponentFixture<SpotifyButtonPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SpotifyButtonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
