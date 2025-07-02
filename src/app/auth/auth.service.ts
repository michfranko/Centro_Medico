import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { user } from 'rxfire/auth';
import { User } from 'firebase/auth';
import { map, Observable } from 'rxjs';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  AuthCredential,
  sendPasswordResetEmail,
  UserCredential
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
  ) {}

async login(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    const uid = credential.user?.uid;
    if (!uid) return;

    const docRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as { rol: string };
      const role = data.rol;
      if (role === 'administrador') this.router.navigate(['/admin']);
      else this.router.navigate(['/paciente']);
    }
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);

    switch (error.code) {
      case 'auth/user-not-found':
        alert('El correo no está registrado.');
        break;
      case 'auth/wrong-password':
        alert('La contraseña es incorrecta.');
        break;
      case 'auth/invalid-email':
        alert('El correo ingresado no es válido.');
        break;
      case 'auth/too-many-requests':
        alert('Demasiados intentos fallidos. Intenta más tarde.');
        break;
      default:
        alert('Error al iniciar sesión: ' + error.message);
        break;
    }
  }
}



 async loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' }); 
  const credential = await signInWithPopup(this.auth, provider);
  const uid = credential.user?.uid;
  if (!uid) return;

  const docRef = doc(this.firestore, 'usuarios', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    
    await setDoc(docRef, {
      nombre: credential.user?.displayName,
      email: credential.user?.email,
      rol: 'paciente',
    });
    this.router.navigate(['/paciente']);
    return;
  }

 
  const data = docSnap.data() as { rol: string };
  const role = data.rol;
  if (role === 'administrador') {
    this.router.navigate(['/admin']);
  } else {
    this.router.navigate(['/paciente']);
  }
}


 async registerPaciente(data: {
  email: string,
  password: string,
  nombre: string,
  direccion: string,
  fechaNacimiento: string
}) {
  try {
    const credential = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
    const uid = credential.user?.uid;
    if (!uid) return;

    const docRef = doc(this.firestore, 'usuarios', uid);
    await setDoc(docRef, {
      nombre: data.nombre,
      direccion: data.direccion,
      fechaNacimiento: data.fechaNacimiento,
      email: data.email,
      rol: 'paciente',
    });

    this.router.navigate(['/paciente']);
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);

    switch (error.code) {
      case 'auth/email-already-in-use':
        alert('El correo ya está registrado.');
        break;
      case 'auth/invalid-email':
        alert('El correo ingresado no es válido.');
        break;
      case 'auth/weak-password':
        alert('La contraseña debe tener al menos 6 caracteres.');
        break;
      default:
        alert('Error al registrar: ' + error.message);
        break;
    }
  }
}


  async getUserRole(uid: string): Promise<string | null> {
    const docRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data['rol'] || null;
    }
    return null;
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

   getUid(): Observable<string | null> {
    return user(this.auth).pipe(
      map((user: User | null) => user?.uid || null)
    );
  }
}
