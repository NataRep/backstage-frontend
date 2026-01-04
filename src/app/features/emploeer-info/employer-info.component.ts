import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { User } from '../../core/models/interfaces/auth.models';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { SocialLinkPipe } from '../../shared/pipes/social-link.pipe';

@Component({
  selector: 'app-employer-info',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, IconComponent, SocialLinkPipe],
  templateUrl: './employer-info.component.html',
  styleUrl: './employer-info.component.scss'
})
export class EmployerInfoComponent {
  @Input() employer: User | null = null;
}
