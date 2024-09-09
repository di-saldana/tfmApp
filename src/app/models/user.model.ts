export interface User {
    uid: string,
    spotify_id?: string,
    email: string,
    password: string,
    name: string,
    age: number,
    profile_picture?: string,
    saved_events?: string[],
    invites?: string[], 
    matches?: string[]
    // fave artists, tracks, albums, genres
}

export interface SpotifyUser {
    displayName: string;
    email: string;
    spotifyID: string;
    country: string;
    profileImage?: string;
    followersCount: number;
}
  