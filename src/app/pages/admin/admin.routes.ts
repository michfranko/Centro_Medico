import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { PacienteListComponent } from './pacientes/paciente-list.component';
import { MedicoListComponent } from './medicos/medico-list.component';
import { AgendaListComponent } from './agenda/agenda-list.component';
import { CitasComponent } from './citas/citas.component';
import { AdminListComponent } from './Administradores/admin-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: 'pacientes', component: PacienteListComponent },
      { path: 'medicos', component: MedicoListComponent },
      { path: 'Admin', component: AdminListComponent },
      { path: 'agenda', component: AgendaListComponent },
      { path: 'citas', component: CitasComponent },
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
