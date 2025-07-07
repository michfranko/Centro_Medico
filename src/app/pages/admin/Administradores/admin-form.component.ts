import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
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
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  adminForm!: FormGroup;
  isEdit = false;
  uid: string | null = null;

  
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
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
      this.uid = (this.admin as any).id ?? this.admin.uid ?? null;
      this.adminForm.patchValue({
        nombre: this.admin.nombre,
        direccion: this.admin.direccion,
        fechaNacimiento: this.admin.fechaNacimiento,
        email: this.admin.email,
        contacto: this.admin.contacto
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
      contacto: ['', Validators.required]
    });
  }

async guardar() {
  if (this.adminForm.invalid) return;

  const { password, ...adminData } = this.adminForm.value;
  // Normaliza la fecha para el backend
  let fechaNacimiento = adminData.fechaNacimiento;
  if (fechaNacimiento instanceof Date) {
    fechaNacimiento = fechaNacimiento.toISOString().split('T')[0];
  } else if (typeof fechaNacimiento === 'string' && fechaNacimiento.includes('/')) {
    // Si viene en formato dd/mm/yyyy
    const [d, m, y] = fechaNacimiento.split('/');
    fechaNacimiento = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const payload = {
    ...adminData,
    fecha_nacimiento: fechaNacimiento,
    rol: 'administrador',
    uid: this.admin?.uid, // siempre mantener el uid original
    ...(password ? { password } : {})
  };
  delete payload.fechaNacimiento;

  if (this.isEdit && this.uid) {
    // Editando un admin existente
    const idNum = typeof this.uid === 'string' ? parseInt(this.uid, 10) : this.uid;
    if (isNaN(idNum)) {
      this.snackBar.open('ID de administrador inválido', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
      });
      return;
    }
    this.usuarioService.updateUsuario(idNum, payload).subscribe({
      next: () => {
        this.snackBar.open('Administrador actualizado', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
        });
        this.resetForm();
        this.formSubmit.emit();
        this.router.navigate(['/admin/Admin']);
      },
      error: () => {
        this.snackBar.open('Error al actualizar el administrador', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
        });
      }
    });
  } else {
    // Creando nuevo admin
    this.usuarioService.createUsuario(payload).subscribe({
      next: () => {
        this.snackBar.open('Administrador registrado', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
        });
        this.router.navigate(['/admin/Admin']);
        this.resetForm();
        this.formSubmit.emit();
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
    this.resetForm();
    this.cancelEdit.emit();
  }
}
