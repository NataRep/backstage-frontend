import { ComponentFixture, TestBed } from '@angular/core/testing';

import { employerInfoComponent } from './employer-info.component';

describe('employerInfoComponent', () => {
  let component: employerInfoComponent;
  let fixture: ComponentFixture<employerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [employerInfoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(employerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
