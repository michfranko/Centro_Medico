import { Component, OnInit } from '@angular/core';
import { CitasService, Cita } from '../../services/citas.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paciente-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente-mis-citas.component.html',
  styleUrls: ['./paciente-mis-citas.component.css']
})
export class PacienteMisCitasComponent implements OnInit {
  citas: Cita[] = [];
  pacienteId: number | null = null;

  constructor(
    private citasService: CitasService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.getPerfil().then(perfil => {
      if (perfil && perfil.id) {
        this.pacienteId = perfil.id;
        this.loadCitas();
      }
    });
  }

  loadCitas(): void {
    if (this.pacienteId) {
      this.citasService.getCitasByPaciente(this.pacienteId).subscribe(data => {
        this.citas = data;
      });
    }
  }
}
