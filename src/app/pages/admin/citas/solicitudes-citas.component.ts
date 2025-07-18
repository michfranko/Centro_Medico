import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService, Cita } from '../../../services/citas.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { AgendaService } from '../../../services/agenda.service';
import { MedicoService } from '../../../services/medico.service';
import { UsuarioService } from '../../../services/usuario.service';
import { switchMap, map } from 'rxjs/operators';
import { throwError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitudes-citas.component.html',
  styleUrls: ['./solicitudes-citas.component.css']
})
export class SolicitudesCitasComponent implements OnInit {
  citasPendientes: Cita[] = [];
  loading = true;

  constructor(
    private citasService: CitasService,
    private notificacionesService: NotificacionesService,
    private agendaService: AgendaService,
    private medicoService: MedicoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.obtenerCitasPendientes();
  }

  obtenerCitasPendientes(): void {
    forkJoin({
      citas: this.citasService.getCitas(),
      pacientes: this.usuarioService.getPacientes(),
      medicos: this.medicoService.getMedicos()
    }).pipe(
      map(({ citas, pacientes, medicos }) => {
        return citas
          .filter(cita => cita.estado === 'pendiente')
          .map(cita => {
            return {
              ...cita,
              paciente: pacientes.find(p => p.id === cita.pacienteId),
              medico: medicos.find(m => m.id === cita.medicoId)
            };
          });
      })
    ).subscribe(citasCompletas => {
      this.citasPendientes = citasCompletas;
      this.loading = false;
    });
  }

  confirmarCita(cita: Cita): void {
    if (!cita.id || !cita.agendaId) {
      this.notificacionesService.mostrarNotificacion('Error', 'Datos de la cita incompletos.', 'error');
      return;
    }

    this.citasService.updateEstadoCita(cita.id, 'confirmada').pipe(
      switchMap(() => this.agendaService.updateDisponibilidadAgenda(cita.agendaId, false))
    ).subscribe({
      next: () => {
        this.notificacionesService.mostrarNotificacion(
          'Cita Confirmada',
          'La cita ha sido confirmada y la agenda ha sido actualizada.',
          'success'
        );
        this.obtenerCitasPendientes();
      },
      error: (err: any) => {
        console.error('Error al confirmar la cita:', err);
        this.notificacionesService.mostrarNotificacion('Error', 'Ocurrió un error al confirmar la cita.', 'error');
      }
    });
  }

  rechazarCita(cita: Cita): void {
    if (!cita.id || !cita.agendaId) {
      this.notificacionesService.mostrarNotificacion('Error', 'Datos de la cita incompletos.', 'error');
      return;
    }

    this.citasService.updateEstadoCita(cita.id, 'rechazada').pipe(
      switchMap(() => this.agendaService.updateDisponibilidadAgenda(cita.agendaId, true))
    ).subscribe({
      next: () => {
        this.notificacionesService.mostrarNotificacion(
          'Cita Rechazada',
          'La cita ha sido rechazada y la agenda ha sido actualizada.',
          'warning'
        );
        this.obtenerCitasPendientes();
      },
      error: (err: any) => {
        console.error('Error al rechazar la cita:', err);
        this.notificacionesService.mostrarNotificacion('Error', 'Ocurrió un error al rechazar la cita.', 'error');
      }
    });
  }

  eliminarCita(cita: any) {
    if (confirm('¿Seguro que quieres eliminar esta cita?')) {
      this.citasService.deleteCita(Number(cita.id)).subscribe({
        next: () => {
          this.notificacionesService.mostrarNotificacion(
            'Cita Eliminada',
            'La cita ha sido eliminada correctamente.',
            'success'
          );
          this.obtenerCitasPendientes();
        },
        error: err => {
          console.error('Error al eliminar cita:', err);
          this.notificacionesService.mostrarNotificacion(
            'Error',
            'No se pudo eliminar la cita.',
            'error'
          );
        }
      });
    }
  }
}
