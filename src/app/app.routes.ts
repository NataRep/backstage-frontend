import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { LoginLayoutComponent } from './layout/login-layout/login-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginLayoutComponent,
    // canActivate: [GuestGuard],
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: '404', component: NotFoundComponent }
    ]
  },

  //{
  //path: '**',
  //canActivate: [notFoundGuard] 
  //}
];
