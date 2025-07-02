// src/app/pages/admin/pacientes/paciente-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente } from '../../../models/paciente.model';
import { Observable } from 'rxjs';
import { PacienteFormComponent } from './paciente-form.component';

@Component({
  standalone: true,
  selector: 'app-paciente-list',
  imports: [CommonModule, PacienteFormComponent],
  styleUrls: ['./paciente-form.component.css'],
  template: `
    <div class="container">
      <h2>Pacientes Registrados</h2>

      <app-paciente-form
        [paciente]="selectedPaciente"
        [isEditMode]="isEditMode"
        (formSubmit)="handleFormSubmit()"
        (cancelEdit)="selectedPaciente = null; isEditMode = false">
      </app-paciente-form>

      <table class="paciente-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Direccion</th>
            <th>Fecha Nacimiento</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let paciente of pacientes$ | async">
              <td>{{ paciente.nombre }}</td>
              <td>{{ paciente.direccion }}</td>
              <td>{{ paciente.fechaNacimiento }}</td>
              <td>{{ paciente.email }}</td>

            <td>
              <button (click)="editPaciente(paciente)">Editar</button>
              <button (click)="deletePaciente(paciente.uid!)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class PacienteListComponent implements OnInit {
  pacientes$!: Observable<Paciente[]>;
  selectedPaciente: Paciente | null = null;
  isEditMode: boolean = false;

  constructor(private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.loadPacientes();
  }

  loadPacientes() {
    this.pacientes$ = this.pacienteService.getPacientes();
  }

  editPaciente(paciente: Paciente): void {
    this.selectedPaciente = { ...paciente };
    this.isEditMode = true;
  }

  deletePaciente(id: string | number): void {
    if (confirm('¿Estás seguro de eliminar este paciente?')) {
      this.pacienteService.deletePaciente(Number(id)).subscribe({
        next: () => this.loadPacientes(),
        error: () => alert('Error al eliminar el paciente.')
      });
    }
  }

  handleFormSubmit() {
    this.selectedPaciente = null;
    this.isEditMode = false;
    this.loadPacientes();
  }
}
