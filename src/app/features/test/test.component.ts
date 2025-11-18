import { Component, inject } from '@angular/core';
import { Person } from '../../core/models/interfaces/auth.models';
import { PersonsService } from '../../core/services/persons.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
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

  constructor() {

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
