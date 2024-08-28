export interface User {
    uid: string,
    spotify_id?: string,
    email: string,
    password: string,
    name: string,
    profile_picture?: string,
    saved_events?: string[],
    invites?: string[], 
    matches?: string[]
    // fave artists, tracks, albums, genres
}