import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../services/citas.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnDestroy {
  isMenuOpen = false;
  isDesktop = window.innerWidth > 900;
  citasPendientesCount = 0;

  private resizeListener = () => {
    this.isDesktop = window.innerWidth > 900;
    if (this.isDesktop) {
      this.isMenuOpen = false;
    }
  };

  private citasSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private citasService: CitasService
  ) {
    window.addEventListener('resize', this.resizeListener);

    this.citasSubscription = this.citasService.getCitas().subscribe(citas => {
      this.citasPendientesCount = (citas || []).filter(c => c.estado === 'pendiente').length;
    });
  }

  cerrarMenu() {
      this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    this.citasSubscription?.unsubscribe();
  }
}
