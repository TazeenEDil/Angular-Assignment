import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTimeTracking } from './admin-time-tracking';

describe('AdminTimeTracking', () => {
  let component: AdminTimeTracking;
  let fixture: ComponentFixture<AdminTimeTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTimeTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTimeTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
