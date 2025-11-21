import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AccessLevel } from '../../../core/models/enums/auth.enums';
import { Role } from '../../../core/models/enums/employee.enums';
import { Employee } from '../../../core/models/interfaces/emploeey.models';
import { EmployeeService } from '../../../core/services/firebase/employee.service';

@Component({
  selector: 'app-employee-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-test.component.html',
  styleUrl: './employee-test.component.scss'
})
export class EmployeeTestComponent implements OnInit, OnDestroy {
  private employeeService = inject(EmployeeService);

  // Сигналы для состояния
  statusMessage = signal('🟢 Ready to test EmployeeService');
  statusClass = signal('status info');
  loading = false;
  logs = signal<Array<{ type: 'success' | 'error' | 'info', message: string, timestamp: Date }>>([]);

  // Тестовые данные
  testEmployee: Employee = {
    id: '',
    personId: 'test-person-' + Date.now(),
    roles: [Role.Artist],
    availability: [],
    isActive: true,
    accessLevel: AccessLevel.Director
  };

  allRoles = Object.values(Role);

  // Отображение данных
  currentEmployeeId = signal<string>('');
  displayEmployee = signal<any>(null);
  displayEmployees = signal<any[]>([]);

  // Real-time подписки
  subscriptions = {
    all: null as Subscription | null,
    one: null as Subscription | null,
    changes: null as Subscription | null
  };

  realtimeData = {
    all: [] as any[],
    one: null as any,
    changes: [] as any[]
  };

  ngOnInit() {
    this.addLog('info', 'EmployeeService Test Component initialized');
  }

  ngOnDestroy() {
    this.unsubscribeAll();
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

  private clearSubscriptionsData() {
    this.realtimeData.all = [];
    this.realtimeData.one = null;
    this.realtimeData.changes = [];
  }

  // === ОПЕРАЦИИ CREATE ===

  async testCreate() {
    this.loading = true;
    this.setStatus('Creating employee...', 'info');

    try {
      // Создаем копию без ID для авто-генерации
      const { id, ...employeeData } = this.testEmployee;
      const newId = await this.employeeService.create(employeeData as Employee);

      this.currentEmployeeId.set(newId);
      this.setStatus(`✅ Employee created successfully with ID: ${newId}`, 'success');
      this.addLog('success', `Created employee with ID: ${newId}`);

      // Обновляем тестовый объект с новым ID
      this.testEmployee.id = newId;

    } catch (error: any) {
      this.setStatus(`❌ Failed to create employee: ${error.message}`, 'error');
      this.addLog('error', `Create failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  async testSetWithId() {
    if (!this.testEmployee.id) {
      this.setStatus('❌ Please enter an ID for setWithId operation', 'error');
      return;
    }

    this.loading = true;
    this.setStatus('Setting employee with specific ID...', 'info');

    try {
      await this.employeeService.setWithId(this.testEmployee.id, this.testEmployee);
      this.currentEmployeeId.set(this.testEmployee.id);
      this.setStatus(`✅ Employee set successfully with ID: ${this.testEmployee.id}`, 'success');
      this.addLog('success', `Set employee with ID: ${this.testEmployee.id}`);

    } catch (error: any) {
      this.setStatus(`❌ Failed to set employee: ${error.message}`, 'error');
      this.addLog('error', `SetWithId failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // === ОПЕРАЦИИ READ ===

  async testGetOne() {
    if (!this.currentEmployeeId()) {
      this.setStatus('❌ No employee ID available for getOne', 'error');
      return;
    }

    this.loading = true;
    this.setStatus('Fetching employee...', 'info');

    try {
      const employee = await this.employeeService.getOne(this.currentEmployeeId());

      if (employee) {
        this.displayEmployee.set(employee);
        this.setStatus(`✅ Employee fetched successfully`, 'success');
        this.addLog('success', `GetOne successful: ${employee.id}`);
      } else {
        this.setStatus('❌ Employee not found', 'error');
        this.addLog('error', `Employee not found: ${this.currentEmployeeId()}`);
      }

    } catch (error: any) {
      this.setStatus(`❌ Failed to fetch employee: ${error.message}`, 'error');
      this.addLog('error', `GetOne failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  async testGetAll() {
    this.loading = true;
    this.setStatus('Fetching all employees...', 'info');

    try {
      const employees = await this.employeeService.getAll();
      this.displayEmployees.set(employees);
      this.setStatus(`✅ Retrieved ${employees.length} employees`, 'success');
      this.addLog('success', `GetAll retrieved ${employees.length} employees`);

    } catch (error: any) {
      this.setStatus(`❌ Failed to fetch employees: ${error.message}`, 'error');
      this.addLog('error', `GetAll failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  async testQuery() {
    this.loading = true;
    this.setStatus('Querying active employees...', 'info');

    try {
      const constraints = [this.employeeService['firebase'].queryConstraintWhere('isActive', '==', true)];
      const employees = await this.employeeService.query(constraints);

      this.displayEmployees.set(employees);
      this.setStatus(`✅ Query found ${employees.length} active employees`, 'success');
      this.addLog('success', `Query found ${employees.length} active employees`);

    } catch (error: any) {
      this.setStatus(`❌ Query failed: ${error.message}`, 'error');
      this.addLog('error', `Query failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // === ОПЕРАЦИИ UPDATE ===

  async testUpdate() {
    if (!this.currentEmployeeId()) {
      this.setStatus('❌ No employee ID available for update', 'error');
      return;
    }

    this.loading = true;
    this.setStatus('Updating employee...', 'info');

    try {
      await this.employeeService.update(this.currentEmployeeId(), {
        isActive: !this.testEmployee.isActive,
        roles: this.testEmployee.roles
      });

      this.testEmployee.isActive = !this.testEmployee.isActive;
      this.setStatus(`✅ Employee updated successfully`, 'success');
      this.addLog('success', `Updated employee: ${this.currentEmployeeId()}`);

    } catch (error: any) {
      this.setStatus(`❌ Failed to update employee: ${error.message}`, 'error');
      this.addLog('error', `Update failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // === ОПЕРАЦИИ DELETE ===

  async testDelete() {
    if (!this.currentEmployeeId()) {
      this.setStatus('❌ No employee ID available for delete', 'error');
      return;
    }

    this.loading = true;
    this.setStatus('Deleting employee...', 'info');

    try {
      await this.employeeService.delete(this.currentEmployeeId());
      this.setStatus(`✅ Employee deleted successfully`, 'success');
      this.addLog('success', `Deleted employee: ${this.currentEmployeeId()}`);

      // Сбрасываем состояние
      this.currentEmployeeId.set('');
      this.displayEmployee.set(null);
      this.testEmployee.id = '';

    } catch (error: any) {
      this.setStatus(`❌ Failed to delete employee: ${error.message}`, 'error');
      this.addLog('error', `Delete failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  async cleanupTestData() {
    this.loading = true;
    this.setStatus('Cleaning up test data...', 'info');

    try {
      const allEmployees = await this.employeeService.getAll();
      const testEmployees = allEmployees.filter(emp =>
        emp.personId.includes('test-person-')
      );

      for (const emp of testEmployees) {
        await this.employeeService.delete(emp.id);
      }

      this.setStatus(`✅ Cleaned up ${testEmployees.length} test employees`, 'success');
      this.addLog('success', `Cleaned up ${testEmployees.length} test employees`);

      // Сбрасываем состояние
      this.currentEmployeeId.set('');
      this.displayEmployee.set(null);
      this.displayEmployees.set([]);
      this.testEmployee.id = '';

    } catch (error: any) {
      this.setStatus(`❌ Cleanup failed: ${error.message}`, 'error');
      this.addLog('error', `Cleanup failed: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // === REAL-TIME ПОДПИСКИ ===

  toggleSubscription(type: 'all' | 'one' | 'changes') {
    if (this.subscriptions[type]) {
      this.unsubscribe(type);
    } else {
      this.subscribe(type);
    }
  }

  private subscribe(type: 'all' | 'one' | 'changes') {
    switch (type) {
      case 'all':
        this.subscriptions.all = this.employeeService.subscribeAll().subscribe({
          next: (employees) => {
            this.realtimeData.all = employees;
            this.addLog('info', `All subscription update: ${employees.length} employees`);
          },
          error: (error) => {
            this.addLog('error', `All subscription error: ${error.message}`);
            this.subscriptions.all = null;
          }
        });
        this.addLog('info', 'Subscribed to all employees');
        break;

      case 'one':
        if (!this.currentEmployeeId()) {
          this.setStatus('❌ Need employee ID for single subscription', 'error');
          return;
        }
        this.subscriptions.one = this.employeeService.subscribeOne(this.currentEmployeeId()).subscribe({
          next: (employee) => {
            this.realtimeData.one = employee;
            this.addLog('info', `One subscription update: ${employee ? employee.id : 'null'}`);
          },
          error: (error) => {
            this.addLog('error', `One subscription error: ${error.message}`);
            this.subscriptions.one = null;
          }
        });
        this.addLog('info', `Subscribed to employee: ${this.currentEmployeeId()}`);
        break;

      case 'changes':
        this.subscriptions.changes = this.employeeService.subscribeChanges().subscribe({
          next: (changes) => {
            this.realtimeData.changes = changes;
            changes.forEach(change => {
              this.addLog('info', `Change: ${change.type} - ${change.doc.id}`);
            });
          },
          error: (error) => {
            this.addLog('error', `Changes subscription error: ${error.message}`);
            this.subscriptions.changes = null;
          }
        });
        this.addLog('info', 'Subscribed to changes');
        break;
    }
  }

  private unsubscribe(type: 'all' | 'one' | 'changes') {
    if (this.subscriptions[type]) {
      this.subscriptions[type]!.unsubscribe();
      this.subscriptions[type] = null;
      this.addLog('info', `Unsubscribed from ${type}`);
    }

    // Очищаем соответствующие данные
    if (type === 'all') this.realtimeData.all = [];
    if (type === 'one') this.realtimeData.one = null;
    if (type === 'changes') this.realtimeData.changes = [];
  }

  private unsubscribeAll() {
    Object.keys(this.subscriptions).forEach(key => {
      this.unsubscribe(key as 'all' | 'one' | 'changes');
    });
  }

  // === ВСПОМОГАТЕЛЬНЫЕ UI МЕТОДЫ ===

  toggleRole(role: Role, event: any) {
    if (event.target.checked) {
      if (!this.testEmployee.roles.includes(role)) {
        this.testEmployee.roles.push(role);
      }
    } else {
      this.testEmployee.roles = this.testEmployee.roles.filter(r => r !== role);
    }
  }

  clearLogs() {
    this.logs.set([]);
    this.addLog('info', 'Logs cleared');
  }
}