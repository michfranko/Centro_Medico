import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicoService } from '../../../services/medico.service';
import { Medico } from '../../../models/medico.model';



@Component({
  standalone: true,
  selector: 'app-medico-form',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./medico-list.component.css'],
  template: `
 <div class="container">
  <h2>{{ medico?.id ? 'Editar Médico' : 'Registrar Médico' }}</h2>
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label>Nombre:</label>
      <input formControlName="nombre" type="text" class="form-control" required />
    </div>

    <div class="form-group">
      <label>Especialidad:</label>
      <input formControlName="especialidad" type="text" class="form-control" required />
    </div>

    <div class="form-group">
      <label>Contacto:</label>
      <input formControlName="contacto" type="text" class="form-control" required />
    </div>

    <div class="buttons">
      <button type="submit" [disabled]="form.invalid">
        {{ medico?.id ? 'Actualizar' : 'Agregar' }}
      </button>
      <button type="button" class="cancel-btn" *ngIf="medico?.id" (click)="cancelEdit.emit()">Cancelar</button>
    </div>
  </form>
</div>

  `,
})
export class MedicoFormComponent implements OnChanges {
  @Input() medico: Medico | null = null;
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private medicoService: MedicoService) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      especialidad: ['', Validators.required],
      contacto: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['medico'] && this.medico) {
      this.form.patchValue(this.medico);
    } else {
      this.form.reset();
    }
  }

  onSubmit(): void {
    const data: Medico = { ...this.form.value };

    if (this.medico?.id) {
      data.id = this.medico.id;
      this.medicoService.updateMedico(Number(data.id), data).subscribe({
        next: () => this.formSubmit.emit(),
        error: () => alert('Error al actualizar el médico.')
      });
    } else {
      this.medicoService.addMedico(data).subscribe({
        next: () => {
          this.form.reset();
          this.formSubmit.emit();
        },
        error: () => alert('Error al agregar el médico.')
      });
    }
  }
}
