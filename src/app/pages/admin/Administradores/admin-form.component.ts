import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Administrador } from '../../../models/admin.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  styleUrls: ['./admin-form.component.css'],
  templateUrl: './admin-form.component.html',
})
export class AdminFormComponent implements OnInit, OnChanges {
  @Input() admin: Administrador | null = null;

  adminForm!: FormGroup;
  isEdit = false;
  uid: string | null = null;

  
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Solo por si se quiere usar con rutas y no con @Input
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute && !this.admin) {
      // podrías cargar datos aquí si necesitas por ID
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['admin'] && this.admin) {
      this.isEdit = true;
      this.uid = this.admin.uid!;
      this.adminForm.patchValue({
        nombre: this.admin.nombre,
        direccion: this.admin.direccion,
        fechaNacimiento: this.admin.fechaNacimiento,
        email: this.admin.email,
      });
      this.adminForm.get('password')?.clearValidators();
      this.adminForm.get('password')?.updateValueAndValidity();
    }
  }

  private initForm() {
    this.adminForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // requerido solo si no es edición
    });
  }

async guardar() {
  if (this.adminForm.invalid) return;

  const { password, ...adminData } = this.adminForm.value;

  if (this.isEdit && this.uid) {
    // ✏️ Editando un admin existente
    this.adminService.updateAdmin(Number(this.uid), { ...adminData, uid: this.uid }).subscribe({
      next: () => {
        this.snackBar.open('Administrador actualizado', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
        });
        this.resetForm();
        this.router.navigate(['/admin/administradores']);
      },
      error: () => {
        this.snackBar.open('Error al actualizar el administrador', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
        });
      }
    });
  } else {
    // 🆕 Creando nuevo admin
    this.adminService.registerAdmin({ ...adminData, rol: 'administrador' }).subscribe({
      next: () => {
        this.snackBar.open('Administrador registrado', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
        });
        this.router.navigate(['/admin/administradores']);
        this.resetForm();
      },
      error: () => {
        this.snackBar.open('Error al registrar el administrador', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
        });
      }
    });
  }
}

// 👇 NUEVO MÉTODO PARA RESETEAR FORMULARIO A ESTADO DE CREACIÓN
private resetForm() {
  this.isEdit = false;
  this.uid = null;
  this.admin = null;
  this.adminForm.reset();
  this.adminForm.get('password')?.setValidators(Validators.required);
  this.adminForm.get('password')?.updateValueAndValidity();
}


  cancelar() {
    window.location.reload();
  }
}
