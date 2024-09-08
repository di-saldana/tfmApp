/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as querystring from 'querystring';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBtJUTpiMKyOdMO9bQIAXeo2dJMLqv9ivw",
    authDomain: "tfm-app-dsl.firebaseapp.com",
    projectId: "tfm-app-dsl",
    storageBucket: "tfm-app-dsl.appspot.com",
    messagingSenderId: "461018850659",
    appId: "1:461018850659:web:7eb90af5074752c6349f56",
    measurementId: "G-BH6F87Y410"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

const spotifyClientId = '63e107aee6b549d980b4075dcd9a93f2';
const spotifyClientSecret = '6a0b6804cd0448c8ad35fb1da92925e3';
const redirectUri = 'http://localhost:8100/tabs/tab1/' // 'https://tfm-app-dsl.firebaseapp.com/__/auth/handler' 

export const login = functions.https.onRequest((req, res) => {
  const scopes = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read user-library-modify playlist-read-private playlist-modify-public playlist-modify-private user-read-recently-played user-top-read user-follow-read user-follow-modify user-read-playback-position user-read-playback-state' // 'user-read-private user-read-email user-top-read';
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    client_id: spotifyClientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes
  })}`;
  res.redirect(authUrl);
});

export const callback = functions.https.onRequest(async (req, res) => {
  const code = req.query.code as string | null;

  if (!code) {
    res.status(400).send('No code found in URL params');
    return;
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }),
    headers: {
      'Authorization': 'Basic ' + Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  try {
    const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });
    const { access_token, refresh_token } = response.data;
    res.json({ access_token, refresh_token });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.response?.data || 'An unknown error occurred');
    } else {
      res.status(500).send('An unknown error occurred');
    }
  }
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });