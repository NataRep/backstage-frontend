import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EmployeeProfile } from '../../core/models/interfaces/employee.models';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ROLE_RU } from '../../shared/constants/texts/common.texts';
import { SocialLinkPipe } from '../../shared/pipes/social-link.pipe';
import { UppercaseFirstLetter } from '../../shared/pipes/uppercase-first-letter.pipe';

@Component({
  selector: 'app-employee-info',
  standalone: true,
  imports: [CommonModule,
    SkeletonComponent,
    IconComponent,
    SocialLinkPipe,
    UppercaseFirstLetter],
  templateUrl: './employee-info.component.html',
  styleUrl: './employee-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeInfoComponent {
  @Input({ required: true }) employee: EmployeeProfile | null = null;
  @Input() showLinks = true;
  readonly rolesTranslate = ROLE_RU;

  get hasEmployee(): boolean {
    return !!this.employee;
  }

  get fullName(): string {
    return this.employee?.person?.fullName ?? '';
  }

  get phone(): string {
    return this.employee?.person?.phone ?? '';
  }

  get email(): string {
    return this.employee?.person?.email ?? '';
  }

  get socialLinks() {
    return this.employee?.person?.socialLinks ?? [];
  }
}
