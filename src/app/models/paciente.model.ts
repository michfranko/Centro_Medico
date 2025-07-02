export interface Paciente {
  uid?: string;
  nombre: string;
  direccion: string;
  fechaNacimiento: string;
  email: string;
  rol?: 'paciente';
}
