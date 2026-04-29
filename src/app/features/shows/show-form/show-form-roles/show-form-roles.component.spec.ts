import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowFormRolesComponent } from './show-form-roles.component';

describe('ShowFormRoleComponent', () => {
  let component: ShowFormRolesComponent;
  let fixture: ComponentFixture<ShowFormRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowFormRolesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ShowFormRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
