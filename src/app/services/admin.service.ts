import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Administrador } from '../models/admin.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://34.67.68.161:8081/api/admins'; // Cambia a /api/usuarios si tu backend lo maneja así

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  registerAdmin(admin: Administrador): Observable<Administrador> {
    return this.http.post<Administrador>(this.apiUrl, admin);
  }

  getAdmins(): Observable<Administrador[]> {
    return this.http.get<Administrador[]>(this.apiUrl);
  }

  getAdminById(id: number): Observable<Administrador> {
    return this.http.get<Administrador>(`${this.apiUrl}/${id}`);
  }

  updateAdmin(id: number, admin: Administrador): Observable<Administrador> {
    return this.http.put<Administrador>(`${this.apiUrl}/${id}`, admin);
  }

  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

