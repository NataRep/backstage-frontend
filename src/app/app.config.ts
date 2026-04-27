import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { environment } from './core/environments/environments';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { AuthEffects } from './core/store/auth/auth.effects';
import { authReducer } from './core/store/auth/auth.reducer';
import { EmployeesEffects } from './core/store/employees/employees.effects';
import { employeeReducer } from './core/store/employees/employees.reducer';
import { InventoryEffects } from './core/store/inventory/inventory.effects';
import { inventoryReducer } from './core/store/inventory/inventory.reducer';
import { NotificationEffects } from './core/store/notification.effects';
import { ShowEffects } from './core/store/shows/shows.effects';
import { showReducer } from './core/store/shows/shows.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      auth: authReducer,
      employees: employeeReducer,
      inventory: inventoryReducer,
      shows: showReducer
    }),
    provideEffects([
      AuthEffects,
      EmployeesEffects,
      InventoryEffects,
      NotificationEffects,
      ShowEffects]),
    provideHttpClient(
      withInterceptors([apiInterceptor])
    ),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ]
};
