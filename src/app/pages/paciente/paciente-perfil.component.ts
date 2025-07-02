import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/paciente.service';
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
  pacienteActual?: Paciente;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    // Usar onAuthStateChanged para asegurar que el usuario esté disponible tras F5
    onAuthStateChanged(this.auth, (usuario: User | null) => {
      if (usuario?.uid) {
        this.pacienteService.getPacienteById(Number(usuario.uid)).subscribe({
          next: (paciente) => {
            if (paciente) {
              this.pacienteActual = paciente;
              this.initForm(paciente, true);
            }
          },
          error: () => {
            alert('Error al obtener los datos del paciente.');
          }
        });
      }
    });
  }

  
initForm(paciente: Paciente, disabled: boolean) {
  this.form = this.fb.group({
    nombre: [paciente.nombre, Validators.required],
    direccion: [paciente.direccion, Validators.required],
    fechaNacimiento: [paciente.fechaNacimiento, Validators.required],
    email: [{ value: paciente.email, disabled: true }]  // Siempre deshabilitado
  });

  if (disabled) {
    this.form.get('nombre')?.disable();
    this.form.get('direccion')?.disable();
    this.form.get('fechaNacimiento')?.disable();
  }
}



  toggleEdit() {
  if (!this.editMode) {
    this.editMode = true;
    this.initForm(this.pacienteActual!, false);
  } else {
    this.guardar();
  }
}


  cancelar() {
    // Sale del modo edición y recarga los datos originales del paciente
    this.editMode = false;
    if (this.pacienteActual) {
      this.initForm(this.pacienteActual, true);
    }
  }

 guardar(): void {
    if (!this.form.valid || !this.pacienteActual?.uid) {
      this.form.markAllAsTouched();
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const raw = this.form.getRawValue();
    // Construir objeto Paciente con todos los campos requeridos
    const datosActualizados: Paciente = {
      uid: this.pacienteActual.uid,
      nombre: raw.nombre ?? '',
      direccion: raw.direccion ?? '',
      fechaNacimiento: raw.fechaNacimiento ?? '',
      email: raw.email ?? this.pacienteActual.email,
      rol: 'paciente'
    };

    this.pacienteService.updatePaciente(Number(this.pacienteActual.uid), datosActualizados).subscribe({
      next: () => {
        this.pacienteService.getPacienteById(Number(this.pacienteActual!.uid!)).subscribe({
          next: (pacienteActualizado) => {
            if (pacienteActualizado) {
              this.pacienteActual = pacienteActualizado;
              this.initForm(this.pacienteActual, true);
            }
            this.editMode = false;
            alert('Datos actualizados correctamente');
          },
          error: () => alert('Error al obtener los datos actualizados del paciente.')
        });
      },
      error: (err) => alert('Error al actualizar: ' + (err?.message || err))
    });
  }

}

