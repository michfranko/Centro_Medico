import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "citas-medicas-f73b9", appId: "1:968692212954:web:332cb882bd47246c8371e3", storageBucket: "citas-medicas-f73b9.firebasestorage.app", apiKey: "AIzaSyAWCMGxJjlBNlUpVTeoOLK4PPDtA8956QQ", authDomain: "citas-medicas-f73b9.firebaseapp.com", messagingSenderId: "968692212954" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
