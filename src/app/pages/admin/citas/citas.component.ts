import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService, Cita } from '../../../services/citas.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  citasPendientes: Cita[] = [];
  loading = true;

  constructor(private citasService: CitasService) {}

  ngOnInit(): void {
    this.obtenerCitasPendientes();
  }

  obtenerCitasPendientes(): void {
    this.citasService.getCitasConNombres().subscribe(citas => {
      this.citasPendientes = citas.filter(cita => cita.estado === 'pendiente');
      this.loading = false;
    });
  }

  confirmarCita(id: number): void {
    this.citasService.updateEstadoCita(id, 'confirmada')
      .subscribe(() => this.obtenerCitasPendientes());
  }

  rechazarCita(id: number): void {
    this.citasService.updateEstadoCita(id, 'rechazada')
      .subscribe(() => this.obtenerCitasPendientes());
  }

  eliminarCita(cita: any) {
    if (confirm('¿Seguro que quieres eliminar esta cita?')) {
      this.citasService.deleteCita(Number(cita.id)).subscribe({
        next: () => {
          alert('Cita eliminada.');
          this.obtenerCitasPendientes();
        },
        error: err => {
          console.error('Error al eliminar cita:', err);
          alert('No se pudo eliminar la cita.');
        }
      });
    }
  }

}

