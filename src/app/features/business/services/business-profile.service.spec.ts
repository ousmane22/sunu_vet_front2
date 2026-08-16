import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BusinessProfileService } from './business-profile.service';
import { environment } from '../../../../environments/environment';

describe('BusinessProfileService', () => {
  let service: BusinessProfileService;
  let httpMock: HttpTestingController;
  const profileUrl = `${environment.apiUrl}/business/profile`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BusinessProfileService],
    });
    service = TestBed.inject(BusinessProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should cache profile until invalidateProfile', () => {
    let changedCount = 0;
    service.onChanged().subscribe(() => changedCount++);

    service.getProfile().subscribe();
    const req1 = httpMock.expectOne(profileUrl);
    req1.flush({ data: { settings: { require_open_register: false } } });

    service.getProfile().subscribe();
    httpMock.expectNone(profileUrl);

    service.invalidateProfile();
    expect(changedCount).toBe(1);

    service.getProfile().subscribe();
    const req2 = httpMock.expectOne(profileUrl);
    req2.flush({ data: { settings: { require_open_register: true } } });
  });

  it('should force refresh without emitting onChanged', () => {
    let changedCount = 0;
    service.onChanged().subscribe(() => changedCount++);

    service.getProfile().subscribe();
    httpMock.expectOne(profileUrl).flush({ data: { settings: {} } });

    service.getProfile(true).subscribe();
    httpMock.expectOne(profileUrl).flush({ data: { settings: { require_open_register: true } } });

    expect(changedCount).toBe(0);
  });

  it('should invalidate cache after updateProfile', () => {
    service.getProfile().subscribe();
    httpMock.expectOne(profileUrl).flush({ data: { settings: {} } });

    service.updateProfile({ settings: { require_open_register: true } }).subscribe();
    const putReq = httpMock.expectOne(profileUrl);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({ message: 'OK', data: { settings: { require_open_register: true } } });

    service.getProfile().subscribe();
    httpMock.expectOne(profileUrl).flush({ data: { settings: { require_open_register: true } } });
  });
});
