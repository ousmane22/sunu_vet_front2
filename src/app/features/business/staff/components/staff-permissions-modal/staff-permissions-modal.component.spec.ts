import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPermissionsModalComponent } from './staff-permissions-modal.component';

describe('StaffPermissionsModalComponent', () => {
  let component: StaffPermissionsModalComponent;
  let fixture: ComponentFixture<StaffPermissionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffPermissionsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffPermissionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});




