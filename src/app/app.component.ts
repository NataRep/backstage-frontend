import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/services/toasts.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  toastService = inject(ToastService)
  title = 'backstage-erp';
}
