import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MedicoService } from '../../services/medico.service';
import { CitasService } from '../../services/citas.service';
import { AgendaService } from '../../services/agenda.service';
import { Medico } from '../../models/medico.model';
import { Agenda } from '../../models/agenda.model';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { NotificacionesService } from '../../services/notificaciones.service';
import { AdminService } from '../../services/admin.service';
import { PacienteService } from '../../services/paciente.service';

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

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private citasService: CitasService,
    private agendaService: AgendaService,
    private auth: Auth,
    private notificacionesService: NotificacionesService,
    private adminService: AdminService,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      medicoId: ['', Validators.required],
      agendaId: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.loadMedicos();

    // Cuando se selecciona un médico, carga sus agendas disponibles
    this.form.get('medicoId')?.valueChanges.subscribe(medicoId => {
      const medico = this.medicos.find(m => m.id === medicoId);
      this.nombreMedicoSeleccionado = medico?.nombre || '';
      this.cargarAgendasDisponibles(medicoId);
      this.form.get('agendaId')?.setValue(''); // Limpiar selección anterior
    });
  }

  loadMedicos() {
    this.medicoService.getMedicos().subscribe((lista: Medico[]) => {
      this.medicos = lista;
    });
  }

  cargarAgendasDisponibles(medicoId: string | number) {
    this.agendaService.getAgendasByMedico(Number(medicoId)).subscribe((agendas: Agenda[]) => {
      this.agendasDisponibles = agendas.filter(a => a.disponible);
    });
  }

  solicitarCita() {
    this.mensaje = '';

    if (this.form.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    const usuario = this.auth.currentUser;
    if (!usuario) {
      this.mensaje = 'Debe estar autenticado para solicitar una cita.';
      return;
    }

    // Buscar la agenda seleccionada asegurando comparación robusta de tipos
    const agendaSeleccionada = this.agendasDisponibles.find(a => a.id == this.form.value.agendaId);
    if (!agendaSeleccionada || agendaSeleccionada.disponible !== true) {
      this.mensaje = 'Agenda seleccionada no válida o ya no está disponible.';
      return;
    }

    // Buscar paciente por UID de Firebase para obtener el id numérico
    this.pacienteService.getPacienteByUid(usuario.uid).subscribe({
      next: (paciente: any) => {
        if (!paciente || !paciente.id) {
          this.mensaje = 'No se encontró el paciente en el sistema.';
          return;
        }
        // Adaptar el body al formato esperado por el backend
        const citaPayload = {
          pacienteId: paciente.id,
          motivo: this.form.value.motivo,
          estado: 'pendiente'
        };
        console.log('Cita enviada al backend:', citaPayload);
        this.citasService.solicitarCita(citaPayload, Number(agendaSeleccionada.id)).subscribe({
          next: () => {
            // Notificar al paciente
            this.notificacionesService.enviarCorreo(
              paciente.email,
              `Su solicitud de cita para el día ${agendaSeleccionada.fecha} a las ${agendaSeleccionada.horaInicio} está pendiente de confirmación.`
            );
            // Notificar a todos los administradores
            this.adminService.getAdmins().subscribe(admins => {
              admins.forEach(admin => {
                this.notificacionesService.enviarCorreo(
                  admin.email,
                  `Nueva solicitud de cita pendiente de confirmación para el paciente ${paciente.nombre || usuario.email}.`
                );
              });
            });
            this.notificacionesService.enviarWhatsApp('whatsapp-del-paciente', 'Su cita ha sido solicitada.');
            this.mensaje = '✅ Cita solicitada correctamente. Se ha enviado un correo de notificación al paciente y a los administradores.';
            this.form.reset();
            this.agendasDisponibles = [];
          },
          error: (error) => {
            if (error?.error?.message?.includes('ocupada') || error?.error?.message?.includes('no existe')) {
              this.mensaje = '❌ La agenda ya está ocupada o no existe. Por favor, seleccione otra.';
            } else {
              this.mensaje = '❌ Error al solicitar cita. Intente más tarde.';
            }
          }
        });
      },
      error: () => {
        this.mensaje = '❌ Error al obtener datos del paciente.';
      }
    });
  }
}
