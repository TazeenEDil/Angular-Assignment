import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionDetails } from './position-details';

describe('PositionDetails', () => {
  let component: PositionDetails;
  let fixture: ComponentFixture<PositionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
