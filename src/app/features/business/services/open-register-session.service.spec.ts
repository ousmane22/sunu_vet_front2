import { describe, it, expect, beforeEach } from 'vitest';
import { OpenRegisterSessionService } from './open-register-session.service';

describe('OpenRegisterSessionService', () => {
  let service: OpenRegisterSessionService;

  beforeEach(() => {
    service = new OpenRegisterSessionService();
  });

  it('should block POS when register required and no register', () => {
    expect(service.shouldBlock(true, false, 'pos')).toBe(true);
  });

  it('should not block when register is open', () => {
    expect(service.shouldBlock(true, true, 'pos')).toBe(false);
  });

  it('should not block when setting is disabled', () => {
    expect(service.shouldBlock(false, false, 'pos')).toBe(false);
  });

  it('should not block after continueWithout for the same context', () => {
    service.continueWithout('pos');
    expect(service.shouldBlock(true, false, 'pos')).toBe(false);
  });

  it('should reset continueWithout when context is reset', () => {
    service.continueWithout('consultations');
    service.resetContext('consultations');
    expect(service.shouldBlock(true, false, 'consultations')).toBe(true);
  });

  it('should isolate contexts pos and consultations', () => {
    service.continueWithout('pos');
    expect(service.shouldBlock(true, false, 'consultations')).toBe(true);
  });
});
