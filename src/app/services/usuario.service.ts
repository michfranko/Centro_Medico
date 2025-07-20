import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../models/paciente.model';
import { Administrador } from '../models/admin.model';
import { map } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { Usuario } from '../models/usuario.model';
import { createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://34.67.68.161:8081/api/usuarios';

  constructor(private http: HttpClient, private auth: Auth) {}

  getUsuarioById(id: number): Observable<Paciente | Administrador> {
    return this.http.get<Paciente | Administrador>(`${this.apiUrl}/${id}`);
  }

  updateUsuario(id: number, usuario: Paciente | Administrador): Observable<Paciente | Administrador> {
    return this.http.put<Paciente | Administrador>(`${this.apiUrl}/${id}`, usuario);
  }

  getUsuarioByEmail(email: string): Observable<Paciente | Administrador> {
    return this.http.get<Paciente | Administrador>(`${this.apiUrl}/email/${encodeURIComponent(email)}`);
  }

  getPerfil(): Observable<Paciente | Administrador> {
    return new Observable(observer => {
      this.auth.currentUser?.getIdToken().then(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        this.http.get<Paciente | Administrador>(`${this.apiUrl}/perfil`, { headers })
          .subscribe({
            next: res => {
              observer.next(res);
              observer.complete();
            },
            error: err => observer.error(err)
          });
      }).catch(err => observer.error(err));
    });
  }

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<(Paciente | Administrador)[]>(this.apiUrl)
      .pipe(
        // Filtrar solo los usuarios con rol 'paciente'
        map(usuarios => usuarios
          .filter(u => u.rol === 'paciente')
          .map((u: any) => ({
            ...u,
            fechaNacimiento: u.fechaNacimiento || u.fecha_nacimiento || '',
          })) as Paciente[]
        )
      );
  }

  getAdmins(): Observable<Administrador[]> {
    return this.http.get<(Administrador | Paciente)[]>(this.apiUrl)
      .pipe(
        map(usuarios => usuarios
          .filter(u => u.rol === 'administrador')
          .map((u: any) => ({
            ...u,
            fechaNacimiento: u.fechaNacimiento || u.fecha_nacimiento || '',
          })) as Administrador[]
        )
      );
  }

  deleteUsuario(uid: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uid}`);
  }

  createUsuario(usuario: Usuario & { password?: string }): Observable<any> {
    if (!usuario.password) {
      throw new Error('La contraseña es obligatoria para crear un usuario.');
    }
    return new Observable(observer => {
      createUserWithEmailAndPassword(this.auth, usuario.email, usuario.password!)
        .then(async (userCredential: UserCredential) => {
          const token = await userCredential.user.getIdToken();
          const usuarioParaBackend = {
            token: token,
            nombre: usuario.nombre,
            direccion: usuario.direccion,
            rol: usuario.rol,
            contacto: usuario.contacto,
            fecha_nacimiento: usuario.fecha_nacimiento
          };

          this.http.post('http://34.67.68.161:8081/api/auth/register', usuarioParaBackend)
            .subscribe({
              next: (res) => {
                observer.next(res);
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
        })
        .catch(error => observer.error(error));
    });
  }

 getUsuarioByUid(uid: string): Observable<Usuario> {
  return this.http.get<Usuario>(`${this.apiUrl}/uid/${uid}`);
}


}
