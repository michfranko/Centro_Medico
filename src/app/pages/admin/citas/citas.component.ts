import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CitasService, Cita } from '../../../services/citas.service';
import { UsuarioService } from '../../../services/usuario.service';
import { MedicoService } from '../../../services/medico.service';
import { Paciente } from '../../../models/paciente.model';
import { Medico } from '../../../models/medico.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  citas: Cita[] = [];
  citasDetalladas: Cita[] = []; // Almacena todas las citas con datos completos
  filtrosVisibles = false;
  filtros: any = {
    pacienteNombre: '',
    medicoNombre: '',
    estado: '',
    especialidad: ''
  };
  isLoading = true; // Para mostrar un indicador de carga

  constructor(
    private citasService: CitasService,
    private usuarioService: UsuarioService,
    private medicoService: MedicoService
  ) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.citasService.getCitas().subscribe({
      next: (citas) => {
        this.citasDetalladas = citas;
        this.citas = [...this.citasDetalladas];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar las citas', err);
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let citasFiltradas = [...this.citasDetalladas];

    const pacienteNombre = this.filtros.pacienteNombre?.toLowerCase().trim();
    if (pacienteNombre) {
      citasFiltradas = citasFiltradas.filter(c =>
        c.pacienteNombre?.toLowerCase().includes(pacienteNombre)
      );
    }

    const medicoNombre = this.filtros.medicoNombre?.toLowerCase().trim();
    if (medicoNombre) {
      citasFiltradas = citasFiltradas.filter(c =>
        c.medicoNombre?.toLowerCase().includes(medicoNombre)
      );
    }

    const estado = this.filtros.estado?.toLowerCase().trim();
    if (estado) {
      citasFiltradas = citasFiltradas.filter(c =>
        c.estado.toLowerCase() === estado
      );
    }

    const especialidad = this.filtros.especialidad?.toLowerCase().trim();
    if (especialidad) {
      citasFiltradas = citasFiltradas.filter(c =>
        c.medico?.especialidad.toLowerCase().includes(especialidad)
      );
    }

    this.citas = citasFiltradas;
  }

  limpiarFiltros(): void {
    this.filtros = {
      pacienteNombre: '',
      medicoNombre: '',
      estado: '',
      especialidad: ''
    };
    this.citas = [...this.citasDetalladas];
  }

  toggleFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  descargarPdf(): void {
    this.citasService.getReportePdf(this.filtros).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_citas.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  descargarExcel(): void {
    this.citasService.getReporteExcel(this.filtros).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_citas.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
