import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output
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
import { EmployeeProfile, WorkerBase } from '../../core/models/interfaces/employee.models';
import { Person, SocialLink, SocialType } from '../../core/models/interfaces/person.model';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { TrimOnBlurDirective } from '../../shared/directive/trim-on-blur.directive';
import { UppercaseFirstLetter } from '../../shared/pipes/uppercase-first-letter.pipe';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, UppercaseFirstLetter, TrimOnBlurDirective],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeFormComponent {
  //TODO - после реализации создания учетки авторизации при создании пользователя на беке убрать полуе id. 
  // он должен генерироваться в firebase auth и добавляться в данные пользователя на беке из uid

  @Input() employee: EmployeeProfile | null = null;
  @Output() save = new EventEmitter<{ person: Person, worker: WorkerBase }>();
  @Output() cancel = new EventEmitter<void>();

  private store = inject(Store);
  currentUser = this.store.selectSignal(selectAuthUser);

  isAdmin: boolean = false;
  readonly roles: Role[] = Object.values(Role);

  form = new FormGroup({
    id: new FormControl('', [Validators.minLength(16), Validators.pattern(/^\S+$/)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ-]+$/)]),
    firstName: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ-]+$/)]),
    roles: new FormArray<FormControl<Role>>([], { validators: [Validators.required] }),
    isAdmin: new FormControl<boolean>(false, { nonNullable: true }),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\+?[78]\d{10}$/)]),
    telegram: new FormControl('', [Validators.pattern(/^\S+$/)]),
    vk: new FormControl('', [Validators.pattern(/^\S+$/)]),
    whatsapp: new FormControl('', [Validators.pattern(/^\S+$/)])
  });

  ngOnChanges() {
    console.log()
    if (this.employee) {
      this.setFormByEmployee();
    } else {
      console.log(generateRandomId());
    }
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const newEmployeeData = this.createNewEmployeeData();
    console.log(newEmployeeData)
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
    this.cancel.emit();
    this.resetForm();
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
    if (!this.employee) return;
    console.log("this.employee", this.employee)

    const nameParts = this.employee.person?.fullName?.split(' ')!;
    const [lastName, firstName] = [nameParts[0], nameParts[1]];
    this.isAdmin = this.employee?.worker?.accessLevel === AccessLevel.Admin;

    this.form.patchValue(
      {
        id: this.employee.person?.personId,
        firstName,
        lastName,
        isAdmin: this.isAdmin,
        email: this.employee.person?.email ?? '',
        phone: this.employee.person?.phone ?? '',
        telegram: this.employee.person?.socialLinks?.find(link => link.type === SocialType.TELEGRAM)?.link ?? '',
        vk: this.employee.person?.socialLinks?.find(link => link.type === SocialType.VK)?.link ?? '',
        whatsapp: this.employee.person?.socialLinks?.find(link => link.type === SocialType.WHATSAPP)?.link ?? '',
      },
      { emitEvent: true },
    );

    this.setRolesByEmployee();
  }

  setRolesByEmployee() {
    if (!this.employee) return;
    this.rolesArray.clear();

    if (this.employee.worker) {
      for (const role of this.employee.worker.roles) {
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
    this.rolesArray.markAsTouched();
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

  get rolesArray() {
    return this.form.get('roles') as FormArray<FormControl<Role | null>>;
  }

  get isCheckedAdmin() {
    return this.form.get('isAdmin')?.value;
  }

  get isCreateForm(): boolean {
    return !this.employee;
  }
}

//хелпер имитирует генерацию id из firebase authDS
function generateRandomId(length: number = 28): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
