import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Person, PersonsProps } from '../../../core/models/interfaces/person.model';
import { PersonsService } from '../../../core/services/persons.service';

@Component({
  selector: 'app-person-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-test.component.html',
  styleUrl: './person-test.component.scss'
})
export class PersonsServiceTestComponent implements OnInit {
  private personsService = inject(PersonsService);

  // Сигналы для состояния
  statusMessage = signal('🟢 Ready to test PersonsService');
  statusClass = signal('status info');
  loading = false;
  logs = signal<Array<{ type: 'success' | 'error' | 'info', message: string, timestamp: Date }>>([]);

  // Тестовые данные
  testPerson: Person = {
    personId: 'test-user-' + Date.now(),
    full_name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    telegram: '@testuser',
    whatsapp: '+1234567890',
    vk: 'id123456'
  };

  // Параметры запроса
  queryParams = {
    page: 1,
    limit: 10,
    idsInput: ''
  };

  // Отображение данных
  currentPersonId = signal<string>('');
  displayPerson = signal<Person | null>(null);
  displayPersons = signal<Person[]>([]);

  // Образцы данных для быстрого тестирования
  private sampleData = {
    1: {
      personId: 'sample-user-1',
      full_name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1111111111',
      telegram: '@alicej',
      whatsapp: '+1111111111',
      vk: 'alice_johnson'
    },
    2: {
      personId: 'sample-user-2',
      full_name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '+2222222222',
      telegram: '@bobsmith',
      whatsapp: '+2222222222',
      vk: 'bob_smith'
    },
    3: {
      personId: 'sample-user-3',
      full_name: 'Carol Davis',
      email: 'carol@example.com',
      phone: '+3333333333',
      telegram: '@carold',
      whatsapp: '+3333333333'
    }
  };

  ngOnInit() {
    this.addLog('info', 'PersonsService Test Component initialized');
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  private addLog(type: 'success' | 'error' | 'info', message: string) {
    this.logs.update(logs => [...logs, { type, message, timestamp: new Date() }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  private setStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.statusMessage.set(message);
    this.statusClass.set(`status ${type}`);
  }

  // === ОПЕРАЦИИ CREATE ===

  async testCreatePerson() {
    this.loading = true;
    this.setStatus('Creating person...', 'info');

    try {
      const createdPerson = await this.personsService.createPerson(this.testPerson).toPromise();

      if (createdPerson) {
        this.currentPersonId.set(createdPerson.personId);
        this.displayPerson.set(createdPerson);
        this.setStatus(`✅ Person created successfully: ${createdPerson.personId}`, 'success');
        this.addLog('success', `Created person: ${JSON.stringify(createdPerson)}`);
      }

    } catch (error: any) {
      this.setStatus(`❌ Failed to create person: ${error.message}`, 'error');
      this.addLog('error', `Create failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // === ОПЕРАЦИИ READ ===

  async testGetPersonById() {
    if (!this.currentPersonId()) {
      this.setStatus('❌ No person ID available for getPersonById', 'error');
      return;
    }

    this.loading = true;
    this.setStatus('Fetching person by ID...', 'info');

    try {
      const person = await this.personsService.getPersonById(this.currentPersonId()).toPromise();

      if (person) {
        this.displayPerson.set(person);
        this.setStatus(`✅ Person fetched successfully`, 'success');
        this.addLog('success', `GetPersonById successful: ${JSON.stringify(person)}`);
      } else {
        this.setStatus('❌ Person not found', 'error');
        this.addLog('error', `Person not found: ${this.currentPersonId()}`);
      }

    } catch (error: any) {
      this.setStatus(`❌ Failed to fetch person: ${error.message}`, 'error');
      this.addLog('error', `GetPersonById failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  async testGetAllPersons() {
    this.loading = true;
    this.setStatus('Fetching all persons...', 'info');

    try {
      const params: PersonsProps = {
        page: this.queryParams.page,
        limit: this.queryParams.limit
      };

      // Добавляем IDs если они указаны
      if (this.queryParams.idsInput) {
        params.ids = this.queryParams.idsInput.split(',').map(id => id.trim()).filter(id => id);
      }

      const persons = await this.personsService.getAllPersons(params).toPromise();

      if (persons) {
        this.displayPersons.set(persons);
        this.setStatus(`✅ Retrieved ${persons.length} persons`, 'success');
        this.addLog('success', `GetAllPersons retrieved ${persons.length} persons with params: ${JSON.stringify(params)}`);
      }

    } catch (error: any) {
      this.setStatus(`❌ Failed to fetch persons: ${error.message}`, 'error');
      this.addLog('error', `GetAllPersons failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // === ОПЕРАЦИИ UPDATE ===

  async testUpdatePerson() {
    if (!this.currentPersonId()) {
      this.setStatus('❌ No person ID available for update', 'error');
      return;
    }

    this.loading = true;
    this.setStatus('Updating person...', 'info');

    try {
      const updateData = {
        full_name: this.testPerson.full_name,
        email: this.testPerson.email,
        phone: this.testPerson.phone,
        telegram: this.testPerson.telegram,
        whatsapp: this.testPerson.whatsapp,
        vk: this.testPerson.vk
      };

      const updatedPerson = await this.personsService.updatePerson(this.currentPersonId(), updateData).toPromise();

      if (updatedPerson) {
        this.displayPerson.set(updatedPerson);
        this.setStatus(`✅ Person updated successfully`, 'success');
        this.addLog('success', `Updated person: ${JSON.stringify(updatedPerson)}`);
      }

    } catch (error: any) {
      this.setStatus(`❌ Failed to update person: ${error.message}`, 'error');
      this.addLog('error', `Update failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // === ОПЕРАЦИИ DELETE ===

  async testDeletePerson() {
    if (!this.currentPersonId()) {
      this.setStatus('❌ No person ID available for delete', 'error');
      return;
    }

    this.loading = true;
    this.setStatus('Deleting person...', 'info');

    try {
      const result = await this.personsService.deletePerson(this.currentPersonId()).toPromise();

      this.setStatus(`✅ Person deleted successfully`, 'success');
      this.addLog('success', `Delete result: ${JSON.stringify(result)}`);

      // Сбрасываем состояние
      this.currentPersonId.set('');
      this.displayPerson.set(null);

    } catch (error: any) {
      this.setStatus(`❌ Failed to delete person: ${error.message}`, 'error');
      this.addLog('error', `Delete failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  loadSampleData(sampleNumber: 1 | 2 | 3) {
    const sample = this.sampleData[sampleNumber];
    this.testPerson = { ...sample };
    this.currentPersonId.set(sample.personId);

    this.setStatus(`✅ Loaded sample data ${sampleNumber}`, 'success');
    this.addLog('info', `Loaded sample data: ${sample.personId}`);
  }

  selectPerson(person: Person) {
    this.currentPersonId.set(person.personId);
    this.displayPerson.set(person);
    this.testPerson = { ...person };

    this.addLog('info', `Selected person: ${person.personId}`);
  }

  clearLogs() {
    this.logs.set([]);
    this.addLog('info', 'Logs cleared');
  }

  // Автоматическое обновление IDs в параметрах запроса
  updateIdsParam() {
    if (this.displayPersons().length > 0) {
      this.queryParams.idsInput = this.displayPersons().map(p => p.personId).slice(0, 3).join(', ');
    }
  }
}
