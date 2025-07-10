import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Cita {
  id?: number;
  pacienteId: number;
  pacienteNombre?: string;
  medicoId: number;
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
  horaFin: string;
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
    return this.http.get<Cita[]>(this.apiUrl)
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
    const payload = {
      ...citaData,
      estado: citaData.estado || 'pendiente' // Valor por defecto
    };

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
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status}`;
      
      // Mensajes específicos según código de estado
      switch (error.status) {
        case 400:
          errorMessage += ' - Solicitud incorrecta';
          break;
        case 401:
          errorMessage += ' - No autorizado';
          break;
        case 404:
          errorMessage += ' - Recurso no encontrado';
          break;
        case 500:
          errorMessage += ' - Error interno del servidor';
          break;
      }
      
      // Mensaje del backend si existe
      if (error.error?.message) {
        errorMessage += ` | Detalles: ${error.error.message}`;
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





}