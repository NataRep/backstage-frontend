import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AccessLevel } from '../../../core/models/enums/auth.enums';
import { Role } from '../../../core/models/enums/employee.enums';
import { EmployeeProfile, WorkerBase } from '../../../core/models/interfaces/employee.models';
import { Person, SocialLink, SocialType } from '../../../core/models/interfaces/person.model';
import { selectAuthUser } from '../../../core/store/auth/auth.selectors';
import { IconComponent } from '../../../shared/components/icons/icons.component';
import { ROLE_RU } from '../../../shared/constants/texts/common.texts';
import { TrimOnBlurDirective } from '../../../shared/directive/trim-on-blur.directive';
import { UppercaseFirstLetter } from '../../../shared/pipes/uppercase-first-letter.pipe';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    IconComponent,
    UppercaseFirstLetter,
    TrimOnBlurDirective,
    UppercaseFirstLetter],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeFormComponent implements OnChanges {
  //TODO - после реализации создания учетки авторизации при создании пользователя на беке убрать полуе id. 
  // он должен генерироваться в firebase auth и добавляться в данные пользователя на беке из uid

  @Input() employee: EmployeeProfile | null = null;
  @Output() save = new EventEmitter<{ person: Person, worker: WorkerBase }>();
  @Output() cancelForm = new EventEmitter<void>();

  private store = inject(Store);
  private fb = inject(NonNullableFormBuilder);

  readonly currentUser = this.store.selectSignal(selectAuthUser);
  readonly rolesTranslate = ROLE_RU;
  readonly roles: Role[] = Object.values(Role);
  isAdmin = false;

  form = this.fb.group({
    id: ['', [Validators.minLength(16), Validators.pattern(/^\S+$/)]],
    lastName: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ-]+$/)]],
    firstName: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ-]+$/)]],
    roles: this.fb.array<Role | null>([], [Validators.required]),
    isAdmin: [false],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[78]\d{10}$/)]],
    telegram: ['', [Validators.pattern(/^\S+$/)]],
    vk: ['', [Validators.pattern(/^\S+$/)]],
    whatsapp: ['', [Validators.pattern(/^\S+$/)]]
  });

  // Геттер для удобного доступа к массиву ролей
  get rolesArray() {
    return this.form.controls.roles;
  }

  ngOnChanges() {
    if (this.employee) {
      this.setFormByEmployee();
    } else {
      this.form.controls.id.setValue(generateRandomId());
    }
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const newEmployeeData = this.createNewEmployeeData();
    this.save.emit(newEmployeeData);
  }

  private createNewEmployeeData(): { person: Person, worker: WorkerBase } {

    const { id, email, firstName, lastName, phone, telegram, vk, whatsapp, roles } = this.form.controls;

    const socialLinks: SocialLink[] = [];

    const socialMappings = [
      { control: telegram, type: SocialType.TELEGRAM },
      { control: vk, type: SocialType.VK },
      { control: whatsapp, type: SocialType.WHATSAPP }
    ];

    socialMappings.forEach(({ control, type }) => {
      if (control.value) {
        socialLinks.push({ type, link: control.value });
      }
    });

    const personalData: Person = {
      personId: id.value!,
      type: "employee",
      fullName: `${lastName.value} ${firstName.value}`,
      email: email.value || "",
      phone: phone.value || undefined,
      socialLinks: socialLinks
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

    const employeeData: WorkerBase = {
      roles: [...roles.value as Role[]],
      isActive: true,
      accessLevel: accessLevel(),
      availability: this.employee?.worker?.availability || []
    }

    return { person: personalData, worker: employeeData };
  }

  onCancel() {
    this.cancelForm.emit();
    this.rolesArray.clear();
    this.form.reset();
  }

  resetForm() {
    this.rolesArray.clear();

    this.form.reset({
      id: '',
      firstName: '',
      lastName: '',
      isAdmin: false,
      email: '',
      phone: '',
      telegram: '',
      vk: '',
      whatsapp: ''
    });
  }

  setFormByEmployee() {
    const person = this.employee?.person;
    if (!this.employee || !person) return;

    const [lastName = '', firstName = ''] = person.fullName.trim().split(/\s+/);
    this.isAdmin = this.employee.worker?.accessLevel === AccessLevel.Admin;

    const findSocial = (type: SocialType) =>
      person.socialLinks?.find(link => link.type === type)?.link ?? '';

    this.form.patchValue({
      id: person.personId,
      firstName,
      lastName,
      isAdmin: this.isAdmin,
      email: person.email ?? '',
      phone: person.phone ?? '',
      telegram: findSocial(SocialType.TELEGRAM),
      vk: findSocial(SocialType.VK),
      whatsapp: findSocial(SocialType.WHATSAPP),
    });

    this.setRolesByEmployee();
  }


  setRolesByEmployee() {
    this.rolesArray.clear();
    const roles = this.employee?.worker?.roles || [];

    roles.forEach(role => {
      this.rolesArray.push(this.fb.control(role, [Validators.required]));
    });
  }

  addRole() {
    this.rolesArray.push(
      this.fb.control<Role | null>(null, [Validators.required])
    );
  }

  removeRole(index: number) {
    this.rolesArray.removeAt(index);
    this.rolesArray.markAsDirty();
    this.rolesArray.markAsTouched();
    this.rolesArray.updateValueAndValidity();
  }

  canEditRole() {
    const accessLevel = this.currentUser()?.worker?.accessLevel;
    return (
      accessLevel === AccessLevel.Owner ||
      accessLevel === AccessLevel.Manager ||
      accessLevel === AccessLevel.Admin
    );
  }

  canAppointAdmin() {
    const accessLevel = this.currentUser()?.worker?.accessLevel;
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

    const accessLevel = this.currentUser()?.worker?.accessLevel;

    //назначать владельцами могут только админы и владельцы
    if (accessLevel != AccessLevel.Admin && accessLevel != AccessLevel.Owner) {
      availableRoles = availableRoles.filter((role) => role != Role.Owner);
    }

    return availableRoles;
  }

  get isCheckedAdmin() {
    return this.form.get('isAdmin')?.value;
  }

  get isCreateForm(): boolean {
    return !this.employee;
  }
}

//хелпер имитирует генерацию id из firebase authDS
function generateRandomId(length = 28): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
