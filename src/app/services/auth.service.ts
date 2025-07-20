import { Injectable } from '@angular/core';
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
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private backendUrl = 'http://34.67.68.161:8081/api/usuarios';

  constructor(
    private router: Router,
    private auth: Auth,
    private http: HttpClient
  ) {}

  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const token = await credential.user.getIdToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      // Llama al backend para obtener el usuario y su rol
      const usuario: any = await this.http.get(this.backendUrl + `/perfil`, { headers }).toPromise();
      if (usuario.rol === 'administrador') this.router.navigate(['/admin']);
      else this.router.navigate(['/paciente']);
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
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(this.auth, provider);
      const token = await credential.user.getIdToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      let usuario: any;
      try {
        usuario = await this.http.get(this.backendUrl + `/perfil`, { headers }).toPromise();
      } catch (e: any) {
        // Si no existe, lo creamos en el backend
        await this.http.post(this.backendUrl, {
          uid: credential.user.uid,
          email: credential.user.email,
          nombre: credential.user.displayName,
          direccion: '', // valor por defecto
          fechaNacimiento: '', // valor por defecto
          rol: 'paciente'
        }, { headers }).toPromise();
        usuario = await this.http.get(this.backendUrl + `/perfil`, { headers }).toPromise();
      }
      if (usuario.rol === 'administrador') this.router.navigate(['/admin']);
      else this.router.navigate(['/paciente']);
    } catch (error: any) {
      alert('Error al iniciar sesión con Google: ' + error.message);
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
      const token = await credential.user.getIdToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      // Envía los datos al backend para registrar el usuario
      await this.http.post(this.backendUrl, {
        uid: credential.user.uid,
        email: data.email,
        nombre: data.nombre,
        direccion: data.direccion,
        fechaNacimiento: data.fechaNacimiento,
        rol: 'paciente'
      }, { headers }).toPromise();
      // Consulta el perfil en el backend y navega según el rol
      const usuario: any = await this.http.get(this.backendUrl + `/perfil`, { headers }).toPromise();
      if (usuario.rol === 'administrador') this.router.navigate(['/admin']);
      else this.router.navigate(['/paciente']);
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

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  getUid(): Observable<string | null> {
    return user(this.auth).pipe(
      map((user: User | null) => user?.uid || null)
    );
  }

  async getPerfil(): Promise<any> {
    const user = this.auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.http.get(this.backendUrl + `/perfil`, { headers }).toPromise();
    }
    return null;
  }
}
