import { TestBed } from '@angular/core/testing';

import { SpotifyTokenService } from './spotify-token.service';

describe('SpotifyTokenService', () => {
  let service: SpotifyTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
