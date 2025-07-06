import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { Paciente } from '../../models/paciente.model';
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
  usuarioActual?: Paciente;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.usuarioService.getPerfil().subscribe((usuarioData) => {
      if (this.isPaciente(usuarioData)) {
        // Normaliza la fecha de nacimiento a YYYY-MM-DD para el input date
        let fechaNacimiento = '';
        if ((usuarioData as any).fechaNacimiento) {
          fechaNacimiento = (usuarioData as any).fechaNacimiento;
        } else if ((usuarioData as any).fecha_nacimiento) {
          // Si viene como fecha_nacimiento, conviértelo
          const raw = (usuarioData as any).fecha_nacimiento;
          if (raw) {
            // Si ya es YYYY-MM-DD, úsalo directo, si no, intenta formatear
            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
              fechaNacimiento = raw;
            } else {
              const d = new Date(raw);
              if (!isNaN(d.getTime())) {
                fechaNacimiento = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
              }
            }
          }
        }
        this.usuarioActual = { ...usuarioData, fechaNacimiento };
        this.initForm(this.usuarioActual, true);
      }
    }, () => {
      alert('Error al obtener los datos del usuario.');
    });
  }

  private isPaciente(usuario: any): usuario is Paciente {
    return usuario && usuario.rol === 'paciente';
  }

  
initForm(usuario: Paciente, disabled: boolean) {
    this.form = this.fb.group({
      nombre: [usuario.nombre, Validators.required],
      direccion: [usuario.direccion, Validators.required],
      contacto: [usuario.contacto, Validators.required],
      fechaNacimiento: [usuario.fechaNacimiento, Validators.required],
      email: [{ value: usuario.email, disabled: true }]
    });

    if (disabled) {
      this.form.disable();
    } else {
      this.form.enable();
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
    if (!this.form.valid || !this.usuarioActual?.uid) {
      alert('ID de usuario inválido. No se puede actualizar el perfil.');
      return;
    }
    const idNumber = Number(this.usuarioActual.uid);
    const datosActualizados: Paciente = {
      ...this.usuarioActual,
      ...this.form.getRawValue(),
      rol: 'paciente'
    };
    this.usuarioService.updateUsuario(idNumber, datosActualizados).subscribe({
      next: () => {
        this.usuarioService.getPerfil().subscribe((usuarioActualizado) => {
          if (this.isPaciente(usuarioActualizado)) {
            this.usuarioActual = usuarioActualizado;
            this.initForm(usuarioActualizado, true);
          }
        }, () => alert('Error al refrescar los datos del paciente.'));
      },
      error: () => alert('Error al actualizar el perfil del paciente.')
    });
  }

}

