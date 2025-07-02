// src/app/models/medico.model.ts

export interface Medico {
  id?: string;             // ID generado por Firestore
  nombre: string;
  especialidad: string;
  correo: string;
  telefono: string;
  contacto: string;
}
