import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeUpdate } from './employee-update';

describe('EmployeeUpdate', () => {
  let component: EmployeeUpdate;
  let fixture: ComponentFixture<EmployeeUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
