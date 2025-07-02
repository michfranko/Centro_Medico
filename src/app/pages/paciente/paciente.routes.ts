import { Routes } from '@angular/router';

import { PacienteDashboardComponent } from './paciente-dashboard.component';
import { PacientePerfilComponent } from './paciente-perfil.component';
import { PacienteSolicitarCitaComponent } from './paciente-solicitar-cita.component';
import { PacienteMisCitasComponent } from './paciente-mis-citas.component';

const routes: Routes = [
  {
    path: '',
    component: PacienteDashboardComponent,
    children: [
      { path: 'perfil', component: PacientePerfilComponent },
      { path: 'solicitar-cita', component: PacienteSolicitarCitaComponent },
      { path: 'mis-citas', component: PacienteMisCitasComponent },
      { path: '', redirectTo: 'perfil', pathMatch: 'full' }
    ]
  }
];

export default routes;
