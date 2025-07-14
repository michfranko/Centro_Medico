import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Medico } from '../models/medico.model';
import { Paciente } from '../models/paciente.model';

export interface Cita {
  id?: number;
  paciente?: Paciente;
  medico?: Medico;
  pacienteId?: number;
  pacienteNombre?: string;
  medicoId?: number;
  medicoNombre?: string;
  agendaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estado: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SolicitudCita {
  pacienteId: number;
  medicoId: number;
  agendaId: number;
  motivo: string;
  estado?: string;
  fecha: string;
  horaInicio: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private apiUrl = 'http://localhost:8081/api/citas';
  private retryCount = 2; // Número de reintentos para peticiones GET

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las citas
   * @returns Observable con array de Cita
   */
  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/con-nombres`)
      .pipe(
        retry(this.retryCount),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una cita por ID
   * @param id ID de la cita
   * @returns Observable con la Cita
   */
  getCitaById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(this.retryCount),
        catchError(this.handleError)
      );
  }

  /**
   * Crea una nueva cita (método genérico)
   * @param cita Datos de la cita
   * @returns Observable con la Cita creada
   */
  createCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Solicita una nueva cita (endpoint específico)
   * @param citaData Datos de la solicitud de cita
   * @returns Observable con la Cita creada
   */
  solicitarCita(citaData: SolicitudCita): Observable<Cita> {
    const { ...payload } = citaData;
    return this.http.post<Cita>(`${this.apiUrl}/solicitar`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza una cita existente
   * @param id ID de la cita a actualizar
   * @param cita Datos actualizados
   * @returns Observable con la Cita actualizada
   */
  updateCita(id: number, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, cita)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina una cita
   * @param id ID de la cita a eliminar
   * @returns Observable vacío
   */
  deleteCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza solo el estado de una cita
   * @param id ID de la cita
   * @param estado Nuevo estado
   * @returns Observable con la Cita actualizada
   */
  updateEstadoCita(id: number, estado: string): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}/${id}/estado`, { estado })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene citas con información extendida (nombres)
   * @returns Observable con array de Cita extendida
   */
  getCitasConNombres(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/con-nombres`)
      .pipe(
        retry(this.retryCount),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo centralizado de errores HTTP
   * @param error Error recibido
   * @returns Observable que emite el error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de citas';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}`;
      if (error.error && typeof error.error === 'object') {
        if (error.error.error) {
          errorMessage += ` - ${error.error.error}`;
        }
        if (error.error.message) {
          errorMessage += ` | Detalles: ${error.error.message}`;
        }
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

getCitasByPaciente(pacienteId: number): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:8081/api/citas/paciente/${pacienteId}`);
}

getMedicoById(id: number): Observable<any> {
  return this.http.get<any>(`http://localhost:8081/api/medicos/${id}`);
}

getAgendaById(id: number): Observable<any> {
  return this.http.get<any>(`http://localhost:8081/api/agendas/${id}`);
}

  /**
   * Obtiene citas aplicando filtros dinámicos
   * @param filtros Objeto con los filtros a aplicar
   * @returns Observable con array de Cita
   */
  getCitasFiltradas(filtros: any): Observable<Cita[]> {
    let params = new HttpParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    });

    return this.http.get<Cita[]>(`${this.apiUrl}/filtrar`, { params })
      .pipe(
        retry(this.retryCount),
        catchError(this.handleError)
      );
  }

  /**
   * Descarga un reporte de citas en formato PDF
   * @param filtros Filtros a aplicar al reporte
   * @returns Observable con el blob del PDF
   */
  getReportePdf(filtros: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    });

    return this.http.get(`http://localhost:8081/api/reportes/pdf`, { params, responseType: 'blob' });
  }

  /**
   * Descarga un reporte de citas en formato Excel
   * @param filtros Filtros a aplicar al reporte
   * @returns Observable con el blob del Excel
   */
  getReporteExcel(filtros: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    });

    return this.http.get(`http://localhost:8081/api/reportes/excel`, { params, responseType: 'blob' });
  }
}
