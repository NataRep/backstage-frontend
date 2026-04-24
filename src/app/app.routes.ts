import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InventoryStorageComponent } from './features/inventory/inventory-storage/inventory-storage.component';
import { LoginComponent } from './features/login/login.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { TeamCalendarComponent } from './features/team/team-calendar/team-calendar.component';
import { TeamListComponent } from './features/team/team-list/team-list.component';
import { TeamComponent } from './features/team/team.component';
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
      { path: 'profile', component: UserProfileComponent },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'team',
        component: TeamComponent,
        children: [
          { path: 'list', component: TeamListComponent },
          { path: 'availability', component: TeamCalendarComponent, canDeactivate: [pendingChangesGuard] },
          { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
      },
      { path: 'inventory', component: InventoryStorageComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  {
    path: '**',
    component: NotFoundComponent,
    //canActivate: [notFoundGuard] 
  }
];
