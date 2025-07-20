import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface Notificacion {
  id?: string;
  tipo: 'email' | 'whatsapp' | 'sms' | 'sistema';
  destinatario: string;
  asunto?: string;
  mensaje: string;
  leida?: boolean;
  fechaEnvio?: Date;
  metadata?: any;
}

export interface NotificacionResponse {
  success: boolean;
  message?: string;
  notificacion?: Notificacion;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = 'http://34.59.159.219:8081/api/notificaciones';
  private snackBarConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['notificacion']
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Envía una notificación por correo electrónico
   */
  enviarCorreo(destinatario: string, asunto: string, mensaje: string, metadata?: any): Observable<NotificacionResponse> {
    const notificacion: Notificacion = {
      tipo: 'email',
      destinatario,
      asunto,
      mensaje,
      metadata
    };

    return this.http.post<NotificacionResponse>(`${this.apiUrl}/correo`, notificacion)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Envía una notificación por WhatsApp
   */
  enviarWhatsApp(destinatario: string, mensaje: string, metadata?: any): Observable<NotificacionResponse> {
    const notificacion: Notificacion = {
      tipo: 'whatsapp',
      destinatario,
      mensaje,
      metadata
    };

    return this.http.post<NotificacionResponse>(`${this.apiUrl}/whatsapp`, notificacion)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Envía una notificación por SMS
   */
  enviarSMS(destinatario: string, mensaje: string, metadata?: any): Observable<NotificacionResponse> {
    const notificacion: Notificacion = {
      tipo: 'sms',
      destinatario,
      mensaje,
      metadata
    };

    return this.http.post<NotificacionResponse>(`${this.apiUrl}/sms`, notificacion)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Muestra una notificación en la interfaz de usuario
   */
  mostrarNotificacion(titulo: string, mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.snackBar.open(`${titulo}: ${mensaje}`, 'Cerrar', {
      ...this.snackBarConfig,
      panelClass: [`notificacion-${tipo}`]
    });
  }

  /**
   * Obtiene el historial de notificaciones del usuario
   */
  obtenerHistorial(usuarioId: string, limit: number = 10): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/historial/${usuarioId}?limit=${limit}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Marca una notificación como leída
   */
  marcarComoLeida(notificacionId: string): Observable<NotificacionResponse> {
    return this.http.patch<NotificacionResponse>(`${this.apiUrl}/leer/${notificacionId}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error al procesar la notificación';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      }
    }
    
    // Mostrar notificación de error en UI
    this.mostrarNotificacion('Error', errorMessage, 'error');
    
    return throwError(() => new Error(errorMessage));
  }
}