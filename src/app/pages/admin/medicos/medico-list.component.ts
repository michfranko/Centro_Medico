import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService } from '../../../services/medico.service';
import { Medico } from '../../../models/medico.model';
import { Observable } from 'rxjs';
import { MedicoFormComponent } from './medico-form.component';

@Component({
  standalone: true,
  selector: 'app-medico-list',
  imports: [CommonModule, MedicoFormComponent],
  styleUrls: ['./medico-list.component.css'],
  template: `
    <div class="container">
  
      <app-medico-form
        [medico]="selectedMedico"
        (formSubmit)="handleFormSubmit($event)"
        (cancelEdit)="selectedMedico = null">
      </app-medico-form>

      <table class="medico-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let medico of medicos$ | async">
            <td>{{ medico.nombre }}</td>
            <td>{{ medico.especialidad }}</td>
            <td>{{ medico.contacto }}</td>
            <td class="acciones-boton">
              <button (click)="editMedico(medico)">Editar</button>
              <button (click)="medico.id && deleteMedico(medico.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
        
      </table>
    </div>
  `,
})
export class MedicoListComponent implements OnInit {
  medicos$!: Observable<Medico[]>;
  selectedMedico: Medico | null = null;

  constructor(private medicoService: MedicoService) {}

  ngOnInit(): void {
    this.medicos$ = this.medicoService.getMedicos();
  }

  editMedico(medico: Medico): void {
    this.selectedMedico = { ...medico };
  }

  deleteMedico(id: string | number): void {
    if (confirm('¿Estás seguro de eliminar este médico?')) {
      this.medicoService.deleteMedico(Number(id)).subscribe({
        next: () => {},
        error: () => alert('Error al eliminar el médico.')
      });
    }
  }

  handleFormSubmit(_: void) {
    this.selectedMedico = null;
    // Recargar la lista de médicos tras agregar/editar
    this.medicos$ = this.medicoService.getMedicos();
  }
}
