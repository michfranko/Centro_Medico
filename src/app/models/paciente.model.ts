export interface Paciente {
  id?: number;
  uid?: string;
  nombre: string;
  direccion: string;
  fechaNacimiento: string;
  email: string;
  contacto: string;
  password?: string;
  rol?: 'paciente';
}
