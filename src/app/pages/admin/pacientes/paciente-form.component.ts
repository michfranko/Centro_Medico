// src/app/pages/admin/pacientes/paciente-form.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente } from '../../../models/paciente.model';


@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
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
    private pacienteService: PacienteService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
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
        fechaNacimiento: this.paciente.fechaNacimiento,
        email: this.paciente.email,
        password: ''
      });
      // Hacer que el campo email sea solo lectura pero siga siendo válido
      this.form.get('email')?.setValidators([Validators.required, Validators.email]);
      this.form.get('email')?.updateValueAndValidity();
      // Quitar validadores de password en edición
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.reset();
      // Restaurar validadores de password al registrar
      this.form.get('password')?.setValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formData = this.form.value;

    if (this.paciente?.uid) {
      // Actualizar paciente existente
      this.pacienteService.updatePaciente(Number(this.paciente.uid), {
        nombre: formData.nombre,
        direccion: formData.direccion,
        fechaNacimiento: formData.fechaNacimiento,
        email: formData.email,
        rol: 'paciente'
      }).subscribe({
        next: () => this.formSubmit.emit(),
        error: () => alert('Error al actualizar el paciente.')
      });
    } else {
      // Registrar nuevo paciente
      this.pacienteService.createPaciente({
        nombre: formData.nombre,
        direccion: formData.direccion,
        fechaNacimiento: formData.fechaNacimiento,
        email: formData.email,
        rol: 'paciente'
      }).subscribe({
        next: () => this.formSubmit.emit(),
        error: () => alert('Error al registrar el paciente.')
      });
    }

    this.form.reset();
  }

  cancelar() {
    window.location.reload();
  }
}
