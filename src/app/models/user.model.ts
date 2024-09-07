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
    // favorite_artists?: string[], 
    // favorite_tracks?: string[],
    // favorite_albums?: string[], 
    // favorite_genres?: string[]
}