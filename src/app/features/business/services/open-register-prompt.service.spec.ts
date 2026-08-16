import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenRegisterPromptService } from './open-register-prompt.service';
import { CashRegisterService } from './cash-register.service';
import { BusinessProfileService } from './business-profile.service';
import { OpenRegisterSessionService } from './open-register-session.service';
import type { BusinessProfileResponse } from '../models';
import type { CashRegisterSingleResponse } from '../models/cash-register.model';

describe('OpenRegisterPromptService', () => {
  let service: OpenRegisterPromptService;
  let cashRegisterService: {
    getCurrent: ReturnType<typeof vi.fn>;
    onChanged: ReturnType<typeof vi.fn>;
  };
  let profileService: {
    getProfile: ReturnType<typeof vi.fn>;
    onChanged: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let registerChanged$: Subject<void>;
  let profileChanged$: Subject<void>;

  const profileRequireOpen = (requireOpen: boolean): BusinessProfileResponse => ({
    data: {
      id: 1,
      name: 'Clinique',
      slug: 'clinique',
      email: 'a@test.local',
      phone: null,
      address: null,
      city: null,
      postal_code: null,
      country: null,
      logo: null,
      logo_url: null,
      description: null,
      website: null,
      status: 'active',
      settings: {
        require_open_register: requireOpen,
        shared_cash_register: true,
      },
      is_active: true,
      trial_ends_at: null,
      created_at: '',
      updated_at: '',
    },
  });

  const registerResponse = (data: CashRegisterSingleResponse['data']): CashRegisterSingleResponse => ({
    data,
  });

  const evaluate = (context: 'pos' | 'consultations' = 'pos'): Promise<boolean> =>
    new Promise((resolve) => {
      service.evaluatePrompt(context, resolve);
    });

  beforeEach(() => {
    registerChanged$ = new Subject<void>();
    profileChanged$ = new Subject<void>();

    cashRegisterService = {
      getCurrent: vi.fn(),
      onChanged: vi.fn(() => registerChanged$.asObservable()),
    };

    profileService = {
      getProfile: vi.fn(),
      onChanged: vi.fn(() => profileChanged$.asObservable()),
    };

    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        OpenRegisterPromptService,
        OpenRegisterSessionService,
        { provide: CashRegisterService, useValue: cashRegisterService },
        { provide: BusinessProfileService, useValue: profileService },
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(OpenRegisterPromptService);
  });

  it('should open prompt when require_open_register is true and no register', async () => {
    cashRegisterService.getCurrent.mockReturnValue(of(registerResponse(null)));
    profileService.getProfile.mockReturnValue(of(profileRequireOpen(true)));

    await expect(evaluate()).resolves.toBe(true);
  });

  it('should hide prompt when require_open_register is false', async () => {
    cashRegisterService.getCurrent.mockReturnValue(of(registerResponse(null)));
    profileService.getProfile.mockReturnValue(of(profileRequireOpen(false)));

    await expect(evaluate()).resolves.toBe(false);
  });

  it('should hide prompt when a register is already open', async () => {
    cashRegisterService.getCurrent.mockReturnValue(of(registerResponse({
      id: 9,
      date: '2026-08-16',
      opening_balance: 0,
      status: 'open',
      created_at: '',
    })));
    profileService.getProfile.mockReturnValue(of(profileRequireOpen(true)));

    await expect(evaluate('consultations')).resolves.toBe(false);
  });

  it('should still open prompt when register API fails but profile requires caisse', async () => {
    cashRegisterService.getCurrent.mockReturnValue(throwError(() => new Error('network')));
    profileService.getProfile.mockReturnValue(of(profileRequireOpen(true)));

    await expect(evaluate()).resolves.toBe(true);
  });

  it('should hide prompt when profile API fails', async () => {
    cashRegisterService.getCurrent.mockReturnValue(of(registerResponse(null)));
    profileService.getProfile.mockReturnValue(throwError(() => new Error('network')));

    await expect(evaluate()).resolves.toBe(false);
  });

  it('should re-evaluate when profile changes after settings save', async () => {
    cashRegisterService.getCurrent.mockReturnValue(of(registerResponse(null)));
    profileService.getProfile
      .mockReturnValueOnce(of(profileRequireOpen(false)))
      .mockReturnValueOnce(of(profileRequireOpen(true)));

    const states: boolean[] = [];
    const sub = service.watchRegisterChanges('pos', (open) => states.push(open)).subscribe();

    states.push(await evaluate());
    profileChanged$.next();
    await new Promise((r) => setTimeout(r, 0));

    sub.unsubscribe();
    expect(states).toEqual([false, true]);
  });

  it('should navigate to cash-registers with returnUrl', () => {
    service.openRegisterPage('/business/pos');
    expect(router.navigate).toHaveBeenCalledWith(
      ['/business/cash-registers'],
      { queryParams: { returnUrl: '/business/pos' } },
    );
  });
});
