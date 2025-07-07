import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AgendaService } from '../../../services/agenda.service';
import { MedicoService } from '../../../services/medico.service';
import { Agenda } from '../../../models/agenda.model';
import { Medico } from '../../../models/medico.model';
import { AgendaFormComponent } from './agenda-form.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-agenda-list',
  imports: [CommonModule, FormsModule, AgendaFormComponent],
  templateUrl: './agenda-list.component.html',
  styleUrls: ['./agenda-list.component.css']
})
export class AgendaListComponent implements OnInit {
  agendas$!: Observable<Agenda[]>;
  medicos: Medico[] = [];
  selectedAgenda?: Agenda;
  errorPadre: string = '';
  filtroMedico: string = '';
  medicoFiltradoId: string = '';
  menuOpcion: 'unitaria' | 'completa' | 'actualizacion' = 'unitaria';


  constructor(
    private agendaService: AgendaService,
    private medicoService: MedicoService
  ) {}

  ngOnInit(): void {
    this.loadMedicos();
    this.loadAgendas();
  }

  loadMedicos() {
    this.medicoService.getMedicos().subscribe(meds => {
      this.medicos = meds;
    });
  }

  loadAgendas() {
    this.agendas$ = this.agendaService.getAgendas();
  }

  editAgenda(agenda: Agenda) {
    this.selectedAgenda = { ...agenda };
  }

  deleteAgenda(uid: string | number) {
    if (confirm('¿Seguro que quieres eliminar esta agenda?')) {
      this.agendaService.deleteAgenda(Number(uid)).subscribe({
        next: () => this.loadAgendas(),
        error: () => alert('Error al eliminar la agenda.')
      });
    }
  }

  onSaveAgenda(agenda: Agenda) {
    this.errorPadre = '';
    if (agenda.id) {
      // Edición
      this.agendaService.updateAgenda(Number(agenda.id), agenda).subscribe({
        next: () => {
          this.selectedAgenda = undefined;
          this.loadAgendas();
        },
        error: () => alert('Error al actualizar la agenda.')
      });
    } else {
      // Nuevo registro: validación de solapamiento y fecha
      this.agendaService.getAgendasByMedico(Number(agenda.uidMedico)).subscribe(agendasExistentes => {
        const mismaFecha = (agendasExistentes || []).find(a => a.fecha === agenda.fecha);
        if (mismaFecha) {
          this.errorPadre = 'Ya existe una agenda para este médico en la fecha seleccionada.';
          return;
        }
        const existeSolapamiento = (agendasExistentes || []).some(a =>
          a.fecha === agenda.fecha &&
          (
            (agenda.horaInicio >= a.horaInicio && agenda.horaInicio < a.horaFin) ||
            (agenda.horaFin > a.horaInicio && agenda.horaFin <= a.horaFin) ||
            (agenda.horaInicio <= a.horaInicio && agenda.horaFin >= a.horaFin)
          )
        );
        if (existeSolapamiento) {
          this.errorPadre = 'El médico ya tiene una agenda en ese horario.';
          return;
        }
        this.agendaService.addAgenda(agenda).subscribe({
          next: () => {
            this.selectedAgenda = undefined;
            this.loadAgendas();
          },
          error: () => alert('Error al agregar la agenda.')
        });
      });
    }
  }

  cancelarEdicion() {
    this.selectedAgenda =undefined;
  }

getNombreMedico(medicoId?: string | number): string {
  if (!medicoId) return 'Sin asignar';
  
  // Convert to number if it's a string
  const idNum = typeof medicoId === 'string' ? Number(medicoId) : medicoId;
  if (isNaN(idNum)) return 'Sin asignar';
  
  // Find the medico - convert both IDs to string for comparison to avoid type issues
  const medico = this.medicos.find(m => String(m.id) === String(idNum));
  return medico ? medico.nombre : 'Sin asignar';
}


  get medicosFiltrados(): Medico[] {
    if (!this.filtroMedico.trim()) return this.medicos;
    return this.medicos.filter(m => m.nombre.toLowerCase().includes(this.filtroMedico.toLowerCase()));
  }

  filtrarAgendasPorMedico() {
    if (this.medicoFiltradoId) {
      this.agendas$ = this.agendaService.getAgendasByMedico(Number(this.medicoFiltradoId));
    } else {
      this.loadAgendas();
    }
    this.selectedAgenda = undefined;
  }

  setMenuOpcion(opcion: 'unitaria' | 'completa' | 'actualizacion') {
    this.menuOpcion = opcion;
    this.selectedAgenda = undefined;
    this.errorPadre = '';
  }

}
