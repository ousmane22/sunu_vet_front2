import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffListComponent } from './staff-list.component';

describe('StaffListComponent', () => {
  let component: StaffListComponent;
  let fixture: ComponentFixture<StaffListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffListComponent);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('staff', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});




