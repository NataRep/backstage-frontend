import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { User } from '../../core/models/interfaces/auth.models';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { SocialLinkPipe } from '../../shared/pipes/social-link.pipe';

@Component({
  selector: 'app-employee-info',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, IconComponent, SocialLinkPipe],
  templateUrl: './employee-info.component.html',
  styleUrl: './employee-info.component.scss',
})
export class EmployeeInfoComponent {
  @Input({ required: true }) employee: User | null = null;
  @Input() showLinks = true;

  get hasEmployee(): boolean {
    return !!this.employee;
  }

  get fullName(): string {
    return this.employee?.personal?.full_name ?? '';
  }

  get roles(): string {
    return this.employee?.employee?.roles?.join(', ') ?? '';
  }

  get phone(): string {
    return this.employee?.personal?.phone ?? '';
  }

  get email(): string {
    return this.employee?.personal?.email ?? '';
  }

  get socialLinks() {
    return this.employee?.personal?.social_links ?? [];
  }
}
