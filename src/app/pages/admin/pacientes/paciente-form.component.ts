// src/app/pages/admin/pacientes/paciente-form.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario.service';
import { Paciente } from '../../../models/paciente.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';


@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./paciente-form.component.css'],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="paciente-form">
      <h3>{{ paciente?.uid ? 'Editar' : 'Registrar' }} Paciente</h3>

      <div *ngIf="form.invalid && form.touched" class="error-message">
        Todos los campos deben estar completos para realizar el registro.
      </div>

      <label>Nombre:
        <input formControlName="nombre" type="text">
      </label>

      <label>Dirección:
        <input formControlName="direccion" type="text">
      </label>

      <label>Contacto:
        <input formControlName="contacto" type="text">
      </label>

      <label>Fecha de Nacimiento:
        <input formControlName="fechaNacimiento" type="date">
      </label>

      
      <label>Email:
        <input formControlName="email" type="email" [readonly]="isEditMode">
      </label>

      <label *ngIf="!isEditMode">Contraseña:
        <input formControlName="password" type="password" [required]="!paciente?.uid">
      </label>

      <div class="buttons">
        <button type="submit" [disabled]="form.invalid">
          {{ paciente?.uid ? 'Actualizar' : 'Registrar' }}
        </button>
        <button type="button" (click)="cancelar()">Cancelar</button>
      </div>
    </form>
  `,
  styles: [`
    .paciente-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      margin-bottom: 20px;
    }

    label {
      display: flex;
      flex-direction: column;
    }

    .buttons {
      display: flex;
      justify-content: space-between;
    }

    .error-message {
      color: red;
      margin-bottom: 10px;
    }
  `]
})
export class PacienteFormComponent implements OnChanges {
  @Input() paciente: Paciente | null = null;
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Input() isEditMode: boolean = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private auth: Auth
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      contacto: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paciente'] && this.paciente) {
      this.form.patchValue({
        nombre: this.paciente.nombre,
        direccion: this.paciente.direccion,
        contacto: this.paciente.contacto,
        fecha_nacimiento: this.paciente.fechaNacimiento || this.paciente.fechaNacimiento || '',
        email: this.paciente.email
      });
      // Quitar validadores de password en edición
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.reset();
      // Restaurar validador de password solo en registro
      this.form.get('password')?.setValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

onSubmit(): void {
  if (this.form.invalid) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }

  const formData = this.form.value;
  console.log('Formulario recibido:', formData);

  // Formatear la fecha
  let fechaFormateada = '';
  if (formData.fechaNacimiento) {
    const date = new Date(formData.fechaNacimiento);
    fechaFormateada = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  if (this.paciente && this.paciente.uid) {
    // 🔁 Modo edición
    const pacienteActualizado: any = {
      ...this.paciente,
      nombre: formData.nombre,
      direccion: formData.direccion,
      contacto: formData.contacto,
      fecha_nacimiento: fechaFormateada,
      email: formData.email,
      rol: 'paciente'
    };
    const idToUpdate = this.paciente.id ?? this.paciente.uid;
    this.usuarioService.updateUsuario(Number(idToUpdate), pacienteActualizado).subscribe({
      next: () => this.formSubmit.emit(),
      error: (err) => {
        console.error('Error al actualizar paciente:', err);
        alert('Error al actualizar el paciente.');
      }
    });
  } else {
    // ✅ Registro nuevo paciente
    const nuevoPaciente: any = {
      nombre: formData.nombre,
      direccion: formData.direccion,
      contacto: formData.contacto,
      fecha_nacimiento: fechaFormateada,
      email: formData.email,
      password: formData.password,
      rol: 'paciente'
    };

    this.usuarioService.createUsuario(nuevoPaciente).subscribe({
      next: () => {
        alert('Paciente registrado exitosamente.');
        this.formSubmit.emit();
        this.form.reset();
      },
      error: (err) => {
        console.error('Error al guardar en backend:', err);
        alert('Error al registrar el paciente en el backend.');
      }
    });
  }
}


  cancelar() {
    window.location.reload();
  }
}
