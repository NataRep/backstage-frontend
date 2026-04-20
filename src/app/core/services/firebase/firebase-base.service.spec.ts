import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { FirebaseService, WithId } from './firebase-base.service';

interface MockSnapshot {
  id: string;
  exists: () => boolean;
  data: () => Record<string, unknown>;
}

interface MockEntity {
  id: string;
  name?: string;
}

describe('FirebaseService', () => {
  let service: FirebaseService;

  const firestoreMock = jasmine.createSpyObj<Firestore>(
    'Firestore',
    [],
    ['app']
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FirebaseService,
        { provide: Firestore, useValue: firestoreMock }
      ]
    });

    service = TestBed.inject(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('snapshotToEntity', () => {

    it('should correctly merge ID into data object', () => {
      const mockId = 'FIRE-ID-123';

      const mockData: Record<string, unknown> = {
        name: 'Test Object'
      };

      const fakeSnapshot: MockSnapshot = {
        id: mockId,
        exists: () => true,
        data: () => mockData
      };

      const result = service['snapshotToEntity'](
        fakeSnapshot as unknown as DocumentSnapshot<DocumentData>
      ) as WithId<{ name: string }>;

      expect(result.id).toBe(mockId);
      expect(result.name).toBe('Test Object');
    });

    it('should return null if snapshot does not exist', () => {
      const fakeSnapshot: MockSnapshot = {
        id: 'FIRE-ID-404',
        exists: () => false,
        data: () => ({})
      };

      const result = service['snapshotToEntity'](
        fakeSnapshot as unknown as DocumentSnapshot<DocumentData>
      );

      expect(result).toBeNull();
    });

  });

  describe('exists', () => {

    it('should return true if document exists', async () => {
      const collectionName = 'workers';
      const docId = 'worker-123';

      const entity: MockEntity = {
        id: docId,
        name: 'Sergei'
      };

      spyOn(service, 'getOne').and.resolveTo(entity);

      const result = await service.exists(collectionName, docId);

      expect(result).toBeTrue();
      expect(service.getOne).toHaveBeenCalledWith(collectionName, docId);
    });

    it('should return false if document does not exist', async () => {
      const collectionName = 'workers';
      const docId = 'worker-404';

      spyOn(service, 'getOne').and.resolveTo(null);

      const result = await service.exists(collectionName, docId);

      expect(result).toBeFalse();
      expect(service.getOne).toHaveBeenCalledWith(collectionName, docId);
    });

  });

});