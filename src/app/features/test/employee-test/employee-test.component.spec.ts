import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTestComponent } from './employee-test.component';

describe('EmployeeTestComponent', () => {
  let component: EmployeeTestComponent;
  let fixture: ComponentFixture<EmployeeTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
