import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { PacienteListComponent } from './pacientes/paciente-list.component';
import { MedicoListComponent } from './medicos/medico-list.component';
import { AgendaListComponent } from './agenda/agenda-list.component';
import { CitasComponent } from './citas/citas.component';
import { AdminListComponent } from './Administradores/admin-list.component';
import { SolicitudesCitasComponent } from './citas/solicitudes-citas.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: 'pacientes', component: PacienteListComponent },
      { path: 'medicos', component: MedicoListComponent },
      { path: 'Admin', component: AdminListComponent },
      { path: 'agenda', component: AgendaListComponent },
      { path: 'historial-citas', component: CitasComponent },
      { path: 'solicitudes-citas', component: SolicitudesCitasComponent },
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
