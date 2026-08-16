import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenRegisterPromptComponent } from './open-register-prompt.component';

describe('OpenRegisterPromptComponent', () => {
  let fixture: ComponentFixture<OpenRegisterPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenRegisterPromptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenRegisterPromptComponent);
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput('activityLabel', 'une vente');
    fixture.detectChanges();
  });

  it('should not render dialog when open is false', () => {
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should render dialog when open is true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Aucune caisse ouverte');
    expect(dialog.textContent).toContain('une vente');
  });

  it('should emit openRegister when button clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const emitSpy = vi.spyOn(fixture.componentInstance.openRegister, 'emit');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emitSpy).toHaveBeenCalled();
  });
});
