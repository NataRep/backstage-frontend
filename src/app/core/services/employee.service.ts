import { inject, Injectable } from "@angular/core";
import { catchError, forkJoin, from, map, Observable, of, switchMap, throwError } from "rxjs";
import { Employee, EmployeeBase, EmployeeProfile } from "../models/interfaces/employee.models";
import { Person, PersonBase } from "../models/interfaces/person.model";
import { FirebaseEmployeeService } from "./firebase/firebase-employee.service";
import { PersonsService } from "./persons.service";

@Injectable({ providedIn: 'root' })
export class EmployeeManagerService {
  private personService = inject(PersonsService);
  private firebaseFirebaseEmployeeService = inject(FirebaseEmployeeService);

  createEmployee(personal: Person, employmentData: any) {
    return forkJoin({
      personal: this.personService.createPerson(personal).pipe(
        catchError(err => err.code === 'PERSON_ALREADY_EXISTS'
          ? this.personService.getPersonById(personal.personId)
          : throwError(() => err))
      ),
      employment: from(this.firebaseFirebaseEmployeeService.getByPersonId(personal.personId)).pipe(
        switchMap(existing => existing
          ? of(existing)
          : from(this.firebaseFirebaseEmployeeService.create({ ...employmentData, personId: personal.personId }))
            .pipe(map(id => ({ ...employmentData, personId: personal.personId, id })))
        )
      )
    });
  }

  updateFullEmployeeProfile(personId: string, personal: PersonBase, employment: EmployeeBase): Observable<EmployeeProfile> {
    return this.personService.updatePerson(personId, personal).pipe(
      switchMap(updatedPersonal =>
        from(this.firebaseFirebaseEmployeeService.getByPersonId(personId)).pipe(
          switchMap(existingEmployee => {
            if (!existingEmployee) {
              return throwError(() => new Error('Employee not found'));
            }
            return from(this.firebaseFirebaseEmployeeService.update(existingEmployee.id, employment)).pipe(
              map(() => ({
                personal: updatedPersonal as Person,
                employment: { ...employment, personId: personId } as Employee
              } as EmployeeProfile))
            );
          })
        )
      )
    );
  }
}