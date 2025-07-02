import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cita {
  id?: number;
  pacienteId: number;
  pacienteNombre?: string;
  medicoId: number;
  medicoNombre?: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private apiUrl = 'http://localhost:8081/api/citas';

  constructor(private http: HttpClient) {}

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  getCitaById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  addCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  updateCita(id: number, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, cita);
  }

  deleteCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Métodos adicionales según lógica de negocio
  updateEstadoCita(id: number, estado: string): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  // Si tienes endpoints para citas con nombres de paciente/médico
  getCitasConNombres(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/con-nombres`);
  }

  // Métodos para agendar/cancelar cita si tu backend los expone
  solicitarCita(cita: Cita, idAgenda: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitar/${idAgenda}`, cita);
  }

  cancelarCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

