import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { PacienteDashboardComponent } from './pages/paciente/paciente-dashboard.component';
import { PacientePerfilComponent } from './pages/paciente/paciente-perfil.component';
import { PacienteSolicitarCitaComponent } from './pages/paciente/paciente-solicitar-cita.component';
import { PacienteMisCitasComponent } from './pages/paciente/paciente-mis-citas.component';
import { RegisterComponent } from './auth/register/register.component';
import { MedicoListComponent } from './pages/admin/medicos/medico-list.component';
import { PacienteListComponent } from './pages/admin/pacientes/paciente-list.component';
import { AdminListComponent } from './pages/admin/Administradores/admin-list.component';
import { AgendaListComponent } from './pages/admin/agenda/agenda-list.component';
import { CitasComponent } from './pages/admin/citas/citas.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: [
      { path: 'medicos', component: MedicoListComponent },
      { path: 'pacientes', component: PacienteListComponent },
      { path: 'Admin', component: AdminListComponent },
      { path: 'agenda', component: AgendaListComponent },
      { path: 'citas', component: CitasComponent },
    ]
  },
  {
    path: 'paciente',
    component: PacienteDashboardComponent,
    children: [
      { path: 'perfil', component: PacientePerfilComponent },
      { path: 'solicitar-cita', component: PacienteSolicitarCitaComponent },
      { path: 'mis-citas', component: PacienteMisCitasComponent },
      { path: '', redirectTo: 'perfil', pathMatch: 'full' }
    ]
  }
];
