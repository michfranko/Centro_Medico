import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged, User } from 'firebase/auth';

@Component({
  selector: 'app-paciente-perfil',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-perfil.component.html',
  styleUrls: ['./paciente-perfil.component.css']
})
export class PacientePerfilComponent implements OnInit {
  form!: FormGroup;
  usuarioActual?: Usuario;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.usuarioService.getPerfil().subscribe({
      next: (usuarioData: Usuario) => {
        if (usuarioData && usuarioData.rol === 'paciente') {
          this.usuarioActual = usuarioData;
          this.initForm(usuarioData, true);
        }
      },
      error: () => {
        alert('Error al obtener los datos del usuario.');
      }
    });
  }

  
initForm(usuario: Usuario, disabled: boolean) {
  this.form = this.fb.group({
    nombre: [usuario.nombre, Validators.required],
    direccion: [usuario.direccion, Validators.required],
    contacto: [usuario.contacto, Validators.required],
    fechaNacimiento: [usuario.fecha_nacimiento, Validators.required],
    email: [{ value: usuario.email, disabled: true }]  // Siempre deshabilitado
  });

  if (disabled) {
    this.form.get('nombre')?.disable();
    this.form.get('direccion')?.disable();
    this.form.get('contacto')?.disable();
    this.form.get('fechaNacimiento')?.disable();
  }
}



  toggleEdit() {
  if (!this.editMode) {
    this.editMode = true;
    this.initForm(this.usuarioActual!, false);
  } else {
    this.guardar();
  }
}


  cancelar() {
    // Sale del modo edición y recarga los datos originales del paciente
    this.editMode = false;
    if (this.usuarioActual) {
      this.initForm(this.usuarioActual, true);
    }
  }

 guardar(): void {
    if (!this.form.valid || !this.usuarioActual?.id) {
      this.form.markAllAsTouched();
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const raw = this.form.getRawValue();
    const idNumber = Number(this.usuarioActual.id);
    if (!this.usuarioActual.id || isNaN(idNumber)) {
      alert('ID de usuario inválido. No se puede actualizar el perfil.');
      return;
    }
    // Construir objeto Paciente con todos los campos requeridos
    const datosActualizados: Usuario = {
      id: this.usuarioActual.id,
      nombre: raw.nombre ?? '',
      direccion: raw.direccion ?? '',
      contacto: raw.contacto ?? '',
      fecha_nacimiento: raw.fechaNacimiento ?? '',
      email: raw.email ?? this.usuarioActual.email,
      rol: 'paciente'
    };

    this.usuarioService.updateUsuario(idNumber, datosActualizados).subscribe({
      next: () => {
        this.usuarioService.getPerfil().subscribe({
          next: (usuarioActualizado: Usuario) => {
            if (usuarioActualizado) {
              this.usuarioActual = usuarioActualizado;
              this.initForm(this.usuarioActual, true);
            }
            this.editMode = false;
            alert('Datos actualizados correctamente');
          },
          error: () => alert('Error al obtener los datos actualizados del usuario.')
        });
      },
      error: (err: any) => alert('Error al actualizar: ' + (err?.message || err))
    });
  }

}

