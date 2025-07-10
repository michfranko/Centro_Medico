import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agenda } from '../models/agenda.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private apiUrl = 'http://localhost:8081/api/agendas';

  constructor(private http: HttpClient) {}


getAgendas(): Observable<Agenda[]> {
  return this.http.get<Agenda[]>(`${this.apiUrl}`);
}

getAgendasByMedico(medicoId: number): Observable<Agenda[]> {
  return this.http.get<Agenda[]>(`${this.apiUrl}/medico/${medicoId}`);
}

addAgenda(agenda: Agenda): Observable<Agenda> {
  return this.http.post<Agenda>(`${this.apiUrl}`, agenda);
}

  updateAgenda(id: number, agenda: Partial<Agenda>): Observable<Agenda> {
    return this.http.put<Agenda>(`${this.apiUrl}/${id}`, agenda);
  }

  deleteAgenda(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateDisponibilidadAgenda(idAgenda: number, disponible: boolean): Observable<Agenda> {
    return this.http.patch<Agenda>(`${this.apiUrl}/${idAgenda}/disponibilidad`, { disponible });
  }

  actualizarAgenda(id: number, cambios: Partial<Agenda>): Observable<Agenda> {
    return this.http.patch<Agenda>(`${this.apiUrl}/${id}`, cambios);
  }

  getAgendaById(id: number): Observable<any> {
  return this.http.get<any>(`http://localhost:8081/api/agendas/${id}`);
}

}
