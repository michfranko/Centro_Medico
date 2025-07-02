export interface Administrador {
  uid?: string;
  nombre: string;
  direccion: string;
  fechaNacimiento: string;
  email: string;
  rol?: 'administrador';
}
