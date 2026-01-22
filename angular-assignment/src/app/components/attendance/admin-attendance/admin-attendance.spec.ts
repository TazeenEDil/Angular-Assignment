import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAttendance } from './admin-attendance';

describe('AdminAttendance', () => {
  let component: AdminAttendance;
  let fixture: ComponentFixture<AdminAttendance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAttendance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAttendance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
