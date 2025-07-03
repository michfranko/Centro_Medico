export interface Usuario {
  id?: number;
  uid?: string;
  email: string;
  password?: string;
  nombre: string;
  direccion?: string;
  fecha_nacimiento?: string;
  contacto?: string;
  rol: 'administrador' | 'paciente';
  creado_en?: string;
}
