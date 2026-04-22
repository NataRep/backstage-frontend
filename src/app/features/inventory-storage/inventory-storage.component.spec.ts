import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryStorageComponent } from './inventory-storage.component';

describe('InventoryStorageComponent', () => {
  let component: InventoryStorageComponent;
  let fixture: ComponentFixture<InventoryStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryStorageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
