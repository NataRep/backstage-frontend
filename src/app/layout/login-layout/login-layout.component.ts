import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-login-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FooterComponent],
  templateUrl: './login-layout.component.html',
  styleUrl: './login-layout.component.scss'
})
export class LoginLayoutComponent {
  currentYear = new Date().getFullYear();

}
