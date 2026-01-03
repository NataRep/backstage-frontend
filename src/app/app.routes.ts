import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { LoginLayoutComponent } from './layout/login-layout/login-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: LoginComponent },
    ]
  },
  {
    path: 'reset-password',
    component: LoginLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: ResetPasswordComponent },
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'profile', component: UserProfileComponent },
      { path: 'dashboard', component: DashboardComponent },
    ]
  },

  {
    path: '**',
    component: NotFoundComponent,
    //canActivate: [notFoundGuard] 
  }
];
