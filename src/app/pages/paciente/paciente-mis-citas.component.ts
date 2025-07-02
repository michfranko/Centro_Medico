import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../services/citas.service';
import { AuthService } from '../../auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-paciente-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente-mis-citas.component.html',
  styleUrls: ['./paciente-mis-citas.component.css']
})
export class PacienteMisCitasComponent implements OnInit {

  citas$: Observable<any[]> = new Observable();

  constructor(private citasService: CitasService, private authService: AuthService) {}

ngOnInit(): void {
  this.citas$ = this.authService.getUid().pipe(
    switchMap(uid =>
      this.citasService.getCitas().pipe(
        map(citas => citas.filter(cita => String(cita.pacienteId) === uid))
      )
    )
  );
}

eliminarCita(cita: any) {
  if (confirm('¿Seguro que quieres cancelar esta cita?')) {
    this.citasService.deleteCita(Number(cita.id)).subscribe({
      next: () => {
        alert('Cita eliminada correctamente.');
        // Opcional: refrescar la lista
        this.ngOnInit();
      },
      error: () => {
        alert('Error al eliminar la cita.');
      }
    });
  }
}


}
