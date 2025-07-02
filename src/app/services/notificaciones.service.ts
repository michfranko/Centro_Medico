import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private apiUrl = 'http://localhost:8081/api/notificaciones';

  constructor(private http: HttpClient) {}

  enviarCorreo(destinatario: string, mensaje: string) {
    return this.http.post(`${this.apiUrl}/correo`, { destinatario, mensaje });
  }

  enviarWhatsApp(destinatario: string, mensaje: string) {
    return this.http.post(`${this.apiUrl}/whatsapp`, { destinatario, mensaje });
  }
}
