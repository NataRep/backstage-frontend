import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowFormInventoryManagerComponent } from './show-form-inventory-manager.component';

describe('ShowFormInventoryManagerComponent', () => {
  let component: ShowFormInventoryManagerComponent;
  let fixture: ComponentFixture<ShowFormInventoryManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowFormInventoryManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowFormInventoryManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
