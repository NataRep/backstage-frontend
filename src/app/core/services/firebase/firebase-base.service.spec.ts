import { TestBed } from '@angular/core/testing';
import { DocumentData, DocumentSnapshot, Firestore } from '@angular/fire/firestore';
import { FirebaseService } from './firebase-base.service';

describe('FirebaseService', () => {
  let service: FirebaseService;
  let firestoreMock: jasmine.SpyObj<Firestore>;

  beforeEach(() => {
    firestoreMock = jasmine.createSpyObj('Firestore', ['type']);

    TestBed.configureTestingModule({
      providers: [
        FirebaseService,
        // Говорим Angular: "Когда кто-то просит Firestore, дай ему нашу подделку"
        { provide: Firestore, useValue: firestoreMock }
      ]
    });

    service = TestBed.inject(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should transform snapshot to entity with ID', () => {
    const fakeData = { name: 'Test Project', version: 1 };
    const fakeId = 'ABC-123';

    const mockSnapshot = {
      exists: () => true,
      id: fakeId,
      data: () => fakeData
    } as unknown as DocumentSnapshot<DocumentData>;

    const result = service['snapshotToEntity'](mockSnapshot);

    expect(result?.id).toBe(fakeId);
  });
});