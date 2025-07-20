import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CitasService, Cita } from '../../services/citas.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-dashboard.component.html',
  styleUrls: ['./paciente-dashboard.component.css']
})
export class PacienteDashboardComponent implements OnDestroy {
  menuOpen = false;
  isDesktop = window.innerWidth > 900;
  citasPendientes: Cita[] = [];
  usuarioId: string | null = null;
  cerrarMenu(){
    this.menuOpen = !this.menuOpen
  }

  private uidSub?: Subscription;
  private citasSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private citasService: CitasService
  ) {
    this.uidSub = this.authService.getUid().subscribe(uid => {
      this.usuarioId = uid;
      if (uid) {
        this.citasSub = this.citasService.getCitas().subscribe(citas => {
          this.citasPendientes = (citas || []).filter(
            (c: any) => c.pacienteId === uid && c.estado === 'pendiente'
          );
        });
      }
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isDesktop = window.innerWidth > 900;
    if (this.isDesktop) {
      this.menuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }

  ngOnDestroy(): void {
    this.uidSub?.unsubscribe();
    this.citasSub?.unsubscribe();
  }
}

