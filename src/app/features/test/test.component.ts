import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Person } from '../../core/models/interfaces/person.model';
import { PersonsService } from '../../core/services/persons.service';
import { EmployeeTestComponent } from './employee-test/employee-test.component';
import { PersonsServiceTestComponent } from './person-test/person-test.component';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeTestComponent,
    PersonsServiceTestComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  diagnostics: any = {};

  private personService = inject(PersonsService);

  protected user: Person = {
    personId: "tsEF1eNkNodmFsSKjuokCkh82BR2",
    email: "pn.88@mail.ru",
    full_name: "Natalia Repkina",
    phone: '+1234567890',
    telegram: '@johndoe',
    whatsapp: '+1234567890',
    vk: 'id123456'
  }

  createUser() {
    this.personService.createPerson(this.user).subscribe({
      next: (res) => console.log('SUCCESS:', res),
      error: (err) => console.error('ERROR:', err)
    });;
  }

  deleteUser() {
    this.personService.deletePerson(this.user.personId).subscribe({
      next: (res) => console.log('SUCCESS:', res),
      error: (err) => console.error('ERROR:', err)
    });
  }

  updateUser() {
    this.personService.updatePerson(this.user.personId, { email: '111@mail.ru' }).subscribe({
      next: (res) => console.log('SUCCESS:', res),
      error: (err) => console.error('ERROR:', err)
    });
  }

  getAllUsers() {
    this.personService.getAllPersons({}).subscribe({
      next: (res) => console.log('SUCCESS:', res),
      error: (err) => console.error('ERROR:', err)
    });
  }
}
