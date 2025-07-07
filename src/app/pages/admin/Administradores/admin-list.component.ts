import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { UsuarioService } from '../../../services/usuario.service';
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

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.admins$ = this.usuarioService.getAdmins();
  }

  editAdmin(admin: Administrador) {
    this.selectedAdmin = { ...admin }; // clonar admin para edición
  }

  deleteAdmin(admin: Administrador) {
    const id = (admin as any).id ?? admin.uid;
    if (!id) {
      alert('No se puede eliminar: el usuario no tiene id ni uid.');
      return;
    }
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.usuarioService.deleteUsuario(id).subscribe({
        next: () => this.admins$ = this.usuarioService.getAdmins(),
        error: () => alert('Error al eliminar el administrador.')
      });
    }
  }
  

  onFormSubmit() {
    this.selectedAdmin = null;  // limpiar el formulario al terminar edición o creación
    this.admins$ = this.usuarioService.getAdmins();
  }
}
