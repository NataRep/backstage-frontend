import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AccessLevel } from '../../core/models/enums/auth.enums';
import { Role } from '../../core/models/enums/employee.enums';
import { User } from '../../core/models/interfaces/auth.models';
import { EmployeeBase } from '../../core/models/interfaces/emploeey.models';
import { PersonBase, SocialLink, SocialType } from '../../core/models/interfaces/person.model';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { UppercaseFirstLetter } from '../../shared/pipes/uppercase-first-letter.pipe';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, UppercaseFirstLetter],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeFormComponent {
  @Input() employee: User | null = null;
  @Output() save = new EventEmitter<{ person: PersonBase, employee: EmployeeBase }>();
  @Output() cancel = new EventEmitter<void>();

  private store = inject(Store);
  currentUser = this.store.selectSignal(selectAuthUser);
  isAdmin: boolean = false;
  readonly roles: Role[] = Object.values(Role);

  form = new FormGroup({
    lastName: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    roles: new FormArray<FormControl<Role | null>>([]),
    isAdmin: new FormControl(),
    email: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    telegram: new FormControl('', []),
    vk: new FormControl('', []),
    whatsapp: new FormControl('', [])
  });

  onSave() {
    const newEmployeeData = this.createNewEmployeeData();
    this.save.emit(newEmployeeData);
  }

  private createNewEmployeeData(): { person: PersonBase, employee: EmployeeBase } {
    const { email, firstName, lastName, phone, telegram, vk, whatsapp, roles } = this.form.controls;

    const socialLinks: SocialLink[] = [];

    const socialMappings = [
      { control: telegram, type: SocialType.TELEGRAM },
      { control: vk, type: SocialType.VK },
      { control: whatsapp, type: SocialType.WHATSAPP }
    ];

    socialMappings.forEach(({ control, type }) => {
      if (control.value) {
        socialLinks.push({ type, url: control.value });
      }
    });

    const personalData: PersonBase = {
      full_name: `${firstName.value} ${lastName.value}`,
      email: email.value || "",
      phone: phone.value || undefined,
      social_links: socialLinks
    };

    const accessLevel = () => {
      if (this.isAdmin) {
        return AccessLevel.Admin
      } else if (roles.value.includes(Role.Owner)) {
        return AccessLevel.Owner
      }
      else if (roles.value.includes(Role.Manager)) {
        return AccessLevel.Manager
      }
      return AccessLevel.Employee
    }

    const employeeData: EmployeeBase = {
      roles: [...roles.value as Role[]],
      isActive: true,
      accessLevel: accessLevel(),
      availability: this.employee?.employee?.availability || []
    }

    return { person: personalData, employee: employeeData };
  }

  onCancel() {
    this.cancel.emit();
  }

  ngOnChanges() {
    if (this.employee) {
      this.setFormByEmployee();
    }
  }

  setFormByEmployee() {
    if (!this.employee) return;

    const nameParts = this.employee.personal?.full_name?.split(' ') ?? [];
    const [firstName, lastName] = [nameParts[0] ?? '', nameParts[1] ?? ''];
    this.isAdmin = this.employee?.employee?.accessLevel === AccessLevel.Admin;

    this.form.patchValue(
      {
        firstName,
        lastName,
        isAdmin: this.isAdmin,
        email: this.employee.personal?.email ?? '-',
        phone: this.employee.personal?.phone ?? '-',
        telegram: this.employee.personal?.social_links?.find(link => link.type === SocialType.TELEGRAM)?.url ?? '-',
        vk: this.employee.personal?.social_links?.find(link => link.type === SocialType.VK)?.url ?? '-',
        whatsapp: this.employee.personal?.social_links?.find(link => link.type === SocialType.WHATSAPP)?.url ?? '-',
      },
      { emitEvent: false },
    );

    this.setRolesByEmployee();
  }

  get rolesArray() {
    return this.form.get('roles') as FormArray<FormControl<Role | null>>;
  }

  setRolesByEmployee() {
    if (!this.employee) return;
    this.rolesArray.clear();

    if (this.employee.employee) {
      for (const role of this.employee.employee.roles) {
        this.rolesArray.push(new FormControl(role));
      }
    }
  }

  addRole() {
    this.rolesArray.push(
      new FormControl<Role | null>(null, Validators.required),
    );
  }

  removeRole(index: number) {
    this.rolesArray.removeAt(index);
  }

  canEditRole() {
    const accessLevel = this.currentUser()?.employee?.accessLevel;
    return (
      accessLevel === AccessLevel.Owner ||
      accessLevel === AccessLevel.Manager ||
      accessLevel === AccessLevel.Admin
    );
  }

  canAppointAdmin() {
    const accessLevel = this.currentUser()?.employee?.accessLevel;
    return (
      accessLevel === AccessLevel.Owner ||
      accessLevel === AccessLevel.Admin
    );
  }

  canAddRole() {
    return !this.roles.every((role) => this.hasRole(role));
  }

  hasRole(role: Role): boolean {
    return this.rolesArray.controls.some((control) => control.value === role);
  }

  getAvailableRolesForControl(controlIndex: number): Role[] {
    const currentControlValue = this.rolesArray.at(controlIndex).value;

    const selectedRoles = this.rolesArray.controls
      .filter((_, index) => index !== controlIndex)
      .map((control) => control.value)
      .filter((role) => role !== null) as Role[];

    let availableRoles = this.roles.filter(
      (role) => !selectedRoles.includes(role) || role === currentControlValue,
    );

    const accessLevel = this.currentUser()?.employee?.accessLevel;

    //назначать владельцами могут только админы и владельцы
    if (accessLevel != AccessLevel.Admin && accessLevel != AccessLevel.Owner) {
      availableRoles = availableRoles.filter((role) => role != Role.Owner);
    }

    return availableRoles;
  }

  get isCheckedAdmin() {
    return this.form.get('isAdmin')?.value;
  }
}
