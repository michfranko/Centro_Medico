import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../services/citas.service';
import { MedicoService } from '../../services/medico.service';
import { AgendaService } from '../../services/agenda.service';
import { UsuarioService } from '../../services/usuario.service';  // Cambiado
import { AuthService } from '../../auth/auth.service';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Usuario } from '../../models/usuario.model'; // importar la interface Usuario

@Component({
  selector: 'app-paciente-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente-mis-citas.component.html',
  styleUrls: ['./paciente-mis-citas.component.css']
})
export class PacienteMisCitasComponent implements OnInit {

  citas$: Observable<any[]> = new Observable();

  constructor(
    private citasService: CitasService,
    private authService: AuthService,
    private usuarioService: UsuarioService, // cambiado
    private medicoService: MedicoService,
    private agendaService: AgendaService
  ) {}

  ngOnInit(): void {
    this.citas$ = this.authService.getUid().pipe(
      switchMap(uid => {
        if (!uid) throw new Error('UID no disponible');
        return this.usuarioService.getUsuarioByUid(uid);
      }),
      switchMap((usuario: Usuario) => {
        if (usuario.rol !== 'paciente') {
          throw new Error('El usuario no es un paciente');
        }
        if (!usuario.id) throw new Error('ID del usuario no definido');
        return this.citasService.getCitasByPaciente(usuario.id);
      }),
      switchMap(citas => {
        const detalles$ = citas.map(cita => {
          return forkJoin({
            medico: this.medicoService.getMedicoById(cita.medico.id), // usa medico.id si tienes objeto medico
            agenda: this.agendaService.getAgendaById(cita.agenda.id)   // usa agenda.id si tienes objeto agenda
          }).pipe(
            map(({ medico, agenda }) => ({
              id: cita.id,
              estado: cita.estado,
              motivo: cita.motivo,
              medicoNombre: medico.nombre,
              fecha: agenda.fecha,
              horaInicio: agenda.horaInicio,
              horaFin: agenda.horaFin
            }))
          );
        });

        return forkJoin(detalles$);
      }),
      catchError(err => {
        console.error('Error al cargar citas:', err);
        return of([]);
      })
    );
  }

  eliminarCita(cita: any) {
    if (confirm('¿Seguro que quieres cancelar esta cita?')) {
      this.citasService.deleteCita(Number(cita.id)).subscribe({
        next: () => {
          alert('Cita eliminada correctamente.');
          this.ngOnInit();
        },
        error: () => {
          alert('Error al eliminar la cita.');
        }
      });
    }
  }
}
