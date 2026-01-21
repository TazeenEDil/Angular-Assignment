import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAttendance } from './employee-attendance';

describe('EmployeeAttendance', () => {
  let component: EmployeeAttendance;
  let fixture: ComponentFixture<EmployeeAttendance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAttendance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAttendance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
