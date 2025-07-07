export interface Agenda {
  id?: number;
  uidMedico?: number; // usado en el form
  medico?: {
    id: number;
    nombre: string;
  }; // viene del backend
  medicoNombre?: string; // usado en FullCalendar
  fecha: string;
  horaInicio: string;
  horaFin: string;
  disponible?: boolean;
}
