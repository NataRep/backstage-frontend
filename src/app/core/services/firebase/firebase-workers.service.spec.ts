import { TestBed } from '@angular/core/testing';
import { QueryConstraint } from 'firebase/firestore';
import { AccessLevel } from '../../models/enums/auth.enums';
import { Worker } from '../../models/interfaces/employee.models';
import { FirebaseService, WithId } from './firebase-base.service';
import { WorkerDataService } from './firebase-workers.service';

describe('WorkerDataService', () => {

  let service: WorkerDataService;
  let firebaseSpy: jasmine.SpyObj<FirebaseService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('FirebaseService', [
      'create', 'setWithId', 'getOne', 'getOneByField',
      'getAll', 'getActiveWorkers', 'query', 'update', 'delete',
      'subscribeCollection', 'subscribeDoc', 'subscribeCollectionChanges'
    ]);

    TestBed.configureTestingModule({
      providers: [
        WorkerDataService,
        { provide: FirebaseService, useValue: spy }
      ]
    });

    service = TestBed.inject(WorkerDataService);
    firebaseSpy = TestBed.inject(FirebaseService) as jasmine.SpyObj<FirebaseService>;
  });

  describe('create', () => {

    it('should call firebase.create with correct parameters', async () => {
      const mockWorker: Worker = {
        personId: 'worker-id',
        roles: [],
        availability: [],
        isActive: true,
        accessLevel: AccessLevel.Manager
      };
      const expectedId = 'new-id-123';

      firebaseSpy.create.and.resolveTo(expectedId);

      const result = await service.create(mockWorker);

      expect(firebaseSpy.create).toHaveBeenCalledWith('employees', mockWorker);
      expect(result).toBe(expectedId);
    });
  });

  describe('getByPersonId', () => {
    const id = 'worker-id';

    const mockWorker: WithId<Worker> = {
      id: "fsddsf",
      personId: 'worker-id',
      roles: [],
      availability: [],
      isActive: true,
      accessLevel: AccessLevel.Manager
    };

    it('should call firebase.getOneByField with correct parameters and return worker', async () => {

      firebaseSpy.getOneByField.and.resolveTo(mockWorker);

      const result = await service.getByPersonId(id);

      expect(firebaseSpy.getOneByField).toHaveBeenCalledWith('employees', 'personId', id,);
      expect(result).toEqual(mockWorker);
      expect(result?.personId).toEqual(id);
    });

    it('should return null if the employee is not found', async () => {

      firebaseSpy.getOneByField.and.resolveTo(null);

      const result = await service.getByPersonId(id);

      expect(result).toBeNull();
    })
  });

  describe('getAll', () => {
    it('should call firebase.getall with correct parameter and return workers', async () => {
      const mockWorkers: WithId<Worker>[] = [{
        id: "test1",
        personId: 'test1',
        roles: [],
        availability: [],
        isActive: true,
        accessLevel: AccessLevel.Manager
      },
      {
        id: "test2",
        personId: 'test2',
        roles: [],
        availability: [],
        isActive: true,
        accessLevel: AccessLevel.Manager
      }];


      firebaseSpy.getAll.and.resolveTo(mockWorkers);
      const result = await service.getAll();

      expect(firebaseSpy.getAll).toHaveBeenCalledWith('employees');
      expect(result).toEqual(mockWorkers);
    });

    it('should return an empty array if no employees exist', async () => {
      firebaseSpy.getAll.and.resolveTo([]);

      const result = await service.getAll();

      expect(result.length).toBe(0);
      expect(result).toEqual([]);
    });

  });

  describe('getAllActive', () => {
    it('should return active workers', async () => {

      const mockWorkers: WithId<Worker>[] = [{
        id: "test1",
        personId: 'test1',
        roles: [],
        availability: [],
        isActive: true,
        accessLevel: AccessLevel.Manager
      },
      {
        id: "test2",
        personId: 'test2',
        roles: [],
        availability: [],
        isActive: true,
        accessLevel: AccessLevel.Manager
      }];

      firebaseSpy.query.and.resolveTo(mockWorkers);

      const result = await service.getAllActiveWorkers();

      expect(firebaseSpy.query).toHaveBeenCalledWith(
        'employees',
        jasmine.any(Array)
      );

      expect(result).toEqual(mockWorkers);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no active workers exist', async () => {
      firebaseSpy.query.and.resolveTo([]);

      const result = await service.getAllActiveWorkers();

      expect(firebaseSpy.query).toHaveBeenCalled();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  })

  describe('query', () => {

    it('should call firebase.query with correct parameters and return workers', async () => {
      const constraints: QueryConstraint[] = [];

      const mockWorkers: WithId<Worker>[] = [
        {
          id: 'q1',
          personId: 'p1',
          roles: [],
          availability: [],
          isActive: true,
          accessLevel: AccessLevel.Manager
        }
      ];

      firebaseSpy.query.and.resolveTo(mockWorkers);

      const result = await service.query(constraints);

      expect(firebaseSpy.query).toHaveBeenCalledWith('employees', constraints);
      expect(result).toEqual(mockWorkers);
    });

  });

  describe('update', () => {

    it('should call firebase.update with correct parameters', async () => {
      const workerId = 'worker-123';

      const patch: Partial<Worker> = {
        isActive: false
      };

      firebaseSpy.update.and.resolveTo();

      await service.update(workerId, patch);

      expect(firebaseSpy.update).toHaveBeenCalledWith(
        'employees',
        workerId,
        patch
      );
    });

  });
  describe('delete', () => {

    it('should call firebase.delete with correct parameters', async () => {
      const workerId = 'worker-999';

      firebaseSpy.delete.and.resolveTo();

      await service.delete(workerId);

      expect(firebaseSpy.delete).toHaveBeenCalledWith(
        'employees',
        workerId
      );
    });

  });
});