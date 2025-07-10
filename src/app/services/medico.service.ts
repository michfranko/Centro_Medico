import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../models/medico.model';


@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = 'http://localhost:8081/api/medicos';

  constructor(private http: HttpClient) {}

  getMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  getMedicoById(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/${id}`);
  }

  addMedico(medico: Medico): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, medico);
  }

  updateMedico(id: number, medico: Medico): Observable<Medico> {
    return this.http.put<Medico>(`${this.apiUrl}/${id}`, medico);
  }

  deleteMedico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }




}
