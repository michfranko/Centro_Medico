import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MedicoService } from '../../services/medico.service';
import { CitasService } from '../../services/citas.service';
import { AgendaService } from '../../services/agenda.service';
import { Medico } from '../../models/medico.model';
import { Agenda } from '../../models/agenda.model'; // Importa Agenda desde su ubicación correcta
import { SolicitudCita } from '../../models/cita.model'; // Importa SolicitudCita
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { NotificacionesService } from '../../services/notificaciones.service';
import { PacienteService } from '../../services/paciente.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-paciente-solicitar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-solicitar-cita.component.html',
  styleUrls: ['./paciente-solicitar-cita.component.css']
})
export class PacienteSolicitarCitaComponent implements OnInit {
  form!: FormGroup;
  medicos: Medico[] = [];
  agendasDisponibles: Agenda[] = [];
  mensaje: string = '';
  nombreMedicoSeleccionado: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private citasService: CitasService,
    private agendaService: AgendaService,
    private auth: Auth,
    private notificacionesService: NotificacionesService,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMedicos();
    this.setupMedicoSelectionListener();
  }

  private initForm(): void {
    this.form = this.fb.group({
  medicoId: [null, Validators.required],
  agendaId: [null, Validators.required],
  motivo: ['', [Validators.required, Validators.minLength(10)]]
  });

  }

  private setupMedicoSelectionListener(): void {
    this.form.get('medicoId')?.valueChanges.subscribe(medicoId => {
      if (medicoId) {
        const medico = this.medicos.find(m => m.id === medicoId);
        this.nombreMedicoSeleccionado = medico?.nombre || '';
        this.cargarAgendasDisponibles(medicoId);
        this.form.get('agendaId')?.setValue('');
      }
    });
  }

  loadMedicos(): void {
    this.isLoading = true;
    this.medicoService.getMedicos()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (medicos: Medico[]) => this.medicos = medicos,
        error: () => this.mensaje = '❌ Error al cargar los médicos. Intente más tarde.'
      });
  }

  cargarAgendasDisponibles(medicoId: number): void {
    this.isLoading = true;
    this.agendaService.getAgendasByMedico(medicoId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (agendas: Agenda[]) => {
          this.agendasDisponibles = agendas.filter(a => a.disponible);
          if (this.agendasDisponibles.length === 0) {
            this.mensaje = 'No hay horarios disponibles para este médico.';
          }
        },
        error: () => this.mensaje = '❌ Error al cargar los horarios disponibles.'
      });
  }

  solicitarCita(): void {
    this.mensaje = '';
    
    if (this.form.invalid) {
      this.marcarControlesComoTouched();
      this.mensaje = '❌ Por favor, complete todos los campos correctamente.';
      return;
    }

    const usuario = this.auth.currentUser;
    if (!usuario) {
      this.mensaje = '❌ Debe estar autenticado para solicitar una cita.';
      return;
    }

    const agendaSeleccionada = this.agendasDisponibles.find(a => a.id === this.form.value.agendaId);
    
    // Verificación estricta según tu modelo Agenda
    if (!agendaSeleccionada || 
        agendaSeleccionada.disponible !== true || 
        !agendaSeleccionada.id || 
        !agendaSeleccionada.fecha || 
        !agendaSeleccionada.horaInicio || 
        !agendaSeleccionada.horaFin) {
      this.mensaje = '❌ La agenda seleccionada no es válida o no está disponible.';
      return;
    }

    this.isLoading = true;
    this.pacienteService.getPacienteByUid(usuario.uid)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (paciente: any) => {
          if (!paciente?.id) {
            this.mensaje = '❌ No se encontró el paciente en el sistema.';
            return;
          }

          // Creación del payload adaptado a tu modelo Agenda
          const citaPayload: SolicitudCita = {
            pacienteId: paciente.id,
            medicoId: agendaSeleccionada.medico?.id! || this.form.value.medicoId,
            agendaId: agendaSeleccionada.id!, // Aquí aseguramos que es number
            motivo: this.form.value.motivo,
            estado: 'pendiente',
            fecha: agendaSeleccionada.fecha,
            horaInicio: agendaSeleccionada.horaInicio,
            horaFin: agendaSeleccionada.horaFin
          };

          this.isLoading = true;
          this.citasService.solicitarCita(citaPayload)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
              next: () => this.onCitaSolicitadaExitosamente(),
              error: (error) => this.handleCitaError(error)
            });
        },
        error: () => {
          this.mensaje = '❌ Error al obtener datos del paciente.';
        }
      });
  }

  private onCitaSolicitadaExitosamente(): void {
    this.mensaje = '✅ Cita solicitada correctamente.';
    this.notificacionesService.mostrarNotificacion('Cita agendada', 'Su cita ha sido solicitada con éxito', 'success');
    this.form.reset();
    this.agendasDisponibles = [];
    this.nombreMedicoSeleccionado = '';
  }

  private handleCitaError(error: any): void {
    console.error('Error al solicitar cita:', error);
    
    if (error?.error?.message) {
      this.mensaje = `❌ ${error.error.message}`;
    } else if (error?.error) {
      this.mensaje = `❌ ${error.error}`;
    } else {
      this.mensaje = '❌ Error al solicitar cita. Intente más tarde.';
    }
  }

  private marcarControlesComoTouched(): void {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}