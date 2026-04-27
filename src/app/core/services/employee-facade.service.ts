import { inject, Injectable } from "@angular/core";
import { catchError, combineLatest, exhaustMap, forkJoin, from, map, Observable, of, switchMap, throwError } from "rxjs";
import { EmployeeProfile, Worker, WorkerBase } from "../models/interfaces/employee.models";
import { Person, PersonBase } from "../models/interfaces/person.model";
import { WithId } from "./firebase/firebase-base.service";
import { PersonDataService } from "./persons.service";
import { WorkerDataService } from "./workers.service";

// EmployeeFacade - Агрегирует данные из двух источников: внешний хост (Persons) и Firestore (Workers).
// ВАЖНО: Текущая реализация использует клиентскую оркестрацию данных (связывание двух баз на стороне фронтенда), 
// так как Cloud Functions временно недоступны. 
// См. README.md раздел Технический долг для плана миграции.

@Injectable({ providedIn: 'root' })
export class EmployeeFacade {
  private personService = inject(PersonDataService);
  private workersService = inject(WorkerDataService);

  getAllEmployees(): Observable<EmployeeProfile[]> {
    // TODO: MIGRATION - При росте базы этот клиентский JOIN станет узким местом. 
    // Перенести сборку EmployeeProfile на Cloud Function для получения агрегированного объекта одним запросом.
    return combineLatest([
      this.personService.getAllEmployees(),
      from(this.workersService.getAll())
    ]).pipe(
      map(([persons, workers]) => {
        if (!persons || !workers) {
          return [];
        }

        const personsMap = new Map(persons.map(p => [p.personId, p]));

        return workers.map((worker): EmployeeProfile => ({
          person: personsMap.get(worker.personId) ?? null,
          worker: worker
        }));
      })
    );
  }

  getAllActiveEmployees(): Observable<EmployeeProfile[]> {
    // TODO: MIGRATION - При росте базы этот клиентский JOIN станет узким местом. 
    // Перенести сборку EmployeeProfile на Cloud Function для получения агрегированного объекта одним запросом.
    return combineLatest([
      this.personService.getAllEmployees(),
      from(this.workersService.getAllActiveWorkers())
    ]).pipe(
      map(([persons, workers]) => {
        if (!persons || !workers) {
          return [];
        }

        const personsMap = new Map(persons.map(p => [p.personId, p]));

        return workers.map((worker): EmployeeProfile => ({
          person: personsMap.get(worker.personId) ?? null,
          worker: worker
        }));
      })
    );
  }


  createEmployee(person: Person, employmentData: WorkerBase) {
    // TODO: MIGRATION-CRITICAL - Этот метод будет заменен на один вызов Cloud Function.
    // Сейчас метод вручную связывает Person и Worker через UID, введенный админом, и предотвращает дубликаты на стороне клиента.
    return forkJoin({
      person: this.personService.createPerson(person).pipe(
        catchError(err => err.code === 'PERSON_ALREADY_EXISTS'
          ? this.personService.getPersonById(person.personId)
          : throwError(() => err))
      ),
      worker: from(this.workersService.getByPersonId(person.personId)).pipe(
        switchMap(existing => existing
          ? of(existing)
          : from(this.workersService.create({ ...employmentData, personId: person.personId }))
            .pipe(map(id => ({ ...employmentData, personId: person.personId, id })))
        )
      )
    });
  }

  updateFullEmployeeProfile(personId: string, person: PersonBase, worker: WorkerBase): Observable<EmployeeProfile> {
    // Обновление профиля в двух базах.
    // TODO: ATOMICITY - На фронтенде невозможно гарантировать транзакционность. 
    // Если один запрос упадет, данные рассинхронизируются. Миграция на функции позволит использовать серверные транзакции.
    return this.personService.updatePerson(personId, person).pipe(
      switchMap(updatedPersonal =>
        from(this.workersService.getByPersonId(personId)).pipe(
          switchMap(existingEmployee => {
            if (!existingEmployee) {
              return throwError(() => new Error('Employee not found'));
            }
            return from(this.workersService.update(existingEmployee.id, worker)).pipe(
              map(() => ({
                person: updatedPersonal as Person,
                worker: { ...worker, personId: personId } as WorkerBase
              } as EmployeeProfile))
            );
          })
        )
      )
    );
  };

  updateWorkerEmployeeProfile(worker: Worker): Observable<Worker> {
    return from(this.workersService.update(worker.id!, worker)).pipe(
      map(() => worker)
    );
  };


  deleteFullEmployeeProfile(id: string): Observable<string> {
    return this.personService.deletePerson(id).pipe(
      exhaustMap(() =>
        from(this.workersService.getByPersonId(id)).pipe(
          switchMap(worker => {
            if (!worker) {
              return of(id);
            }
            return from(this.workersService.delete(worker.id)).pipe(
              map(() => id)
            );
          })
        )
      )
    );
  }

  subscribeAllActiveEmployees(): Observable<EmployeeProfile[]> {
    return this.workersService.subscribeAllActiveEmployees().pipe(
      switchMap((workers) => {
        if (!workers || workers.length === 0) return of([]);
        return this.personService.getAllEmployees().pipe(
          map((persons) => this.mapToEmployeeProfiles(persons, workers))
        );
      })
    );
  }

  private mapToEmployeeProfiles(persons: Person[], workers: WithId<Worker>[]): EmployeeProfile[] {
    if (!persons || !workers) return [];
    const personsMap = new Map(persons.map(p => [p.personId, p]));

    return workers.map(worker => ({
      person: personsMap.get(worker.personId) ?? null,
      worker: worker
    }));
  }
}