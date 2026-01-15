import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileStorage } from './file-storage';

describe('FileStorage', () => {
  let component: FileStorage;
  let fixture: ComponentFixture<FileStorage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileStorage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileStorage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
