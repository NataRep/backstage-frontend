import { inject, Injectable } from "@angular/core";
import { catchError, forkJoin, from, map, Observable, of, switchMap, throwError } from "rxjs";
import { EmployeeProfile, WorkerBase } from "../models/interfaces/employee.models";
import { Person, PersonBase } from "../models/interfaces/person.model";
import { WorkerDataService } from "./firebase/firebase-workers.service";
import { PersonDataService } from "./persons.service";

@Injectable({ providedIn: 'root' })
export class EmployeeFacade {
  private personService = inject(PersonDataService);
  private workersService = inject(WorkerDataService);

  createEmployee(person: Person, employmentData: any) {
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
  }
}