import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarPikerComponent } from './calendar-piker.component';

describe('CalendarPikerComponent', () => {
  let component: CalendarPikerComponent;
  let fixture: ComponentFixture<CalendarPikerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarPikerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarPikerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
