import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { TestComponent } from './features/test/test.component';
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
    path: 'test',
    component: MainLayoutComponent,
    // canActivate: [GuestGuard],
    children: [
      { path: '', component: TestComponent }
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
