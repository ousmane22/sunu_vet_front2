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
    fixture.componentRef.setInput('member', { id: 1, name: 'Test', email: 'test@example.com', role: 'assistant', permissions: [] });
    fixture.componentRef.setInput('availablePermissions', []);
    fixture.componentRef.setInput('isSaving', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});




