import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { Administrador } from '../../../models/admin.model';
import { AdminFormComponent } from './admin-form.component';

@Component({
  standalone: true,
  selector: 'app-admin-list',
  imports: [CommonModule, AdminFormComponent],
  styleUrls: ['./admin-list.component.css'],
  templateUrl: './admin-list.component.html',
})
export class AdminListComponent implements OnInit {
  admins$!: Observable<Administrador[]>;
  selectedAdmin: Administrador | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.admins$ = this.adminService.getAdmins();
  }

  editAdmin(admin: Administrador) {
    this.selectedAdmin = { ...admin }; // clonar admin para edición
  }

  deleteAdmin(uid: string | number) {
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.adminService.deleteAdmin(Number(uid)).subscribe({
        next: () => {},
        error: () => alert('Error al eliminar el administrador.')
      });
    }
  }
  

  onFormSubmit() {
    this.selectedAdmin = null;  // limpiar el formulario al terminar edición o creación
  }
}
