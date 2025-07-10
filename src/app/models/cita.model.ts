export interface SolicitudCita {
  pacienteId: number;
  medicoId: number;
  agendaId: number;  // No opcional
  motivo: string;
  estado?: string;   // Opcional con valor por defecto
  fecha: string;
  horaInicio: string;
  horaFin: string;
}