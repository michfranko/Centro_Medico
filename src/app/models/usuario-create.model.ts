export interface UsuarioCreate {
  nombre: string;
  direccion: string;
  contacto: string;
  fecha_nacimiento: string;
  email: string;
  password: string;
  rol: 'paciente';
}
