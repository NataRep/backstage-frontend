import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { WelcomeMessageService } from '../main-layout/services/welcome-message.service';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-login-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FooterComponent],
  templateUrl: './login-layout.component.html',
  styleUrl: './login-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginLayoutComponent implements OnInit {
  private welcomeMessage = inject(WelcomeMessageService);

  ngOnInit() {
    this.welcomeMessage.reset();
  }
}
