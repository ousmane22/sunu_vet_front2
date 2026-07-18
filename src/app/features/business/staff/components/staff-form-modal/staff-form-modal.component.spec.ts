import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffFormModalComponent } from './staff-form-modal.component';

describe('StaffFormModalComponent', () => {
  let component: StaffFormModalComponent;
  let fixture: ComponentFixture<StaffFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});




