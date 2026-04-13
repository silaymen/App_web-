import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CertificationService } from './certification.service';
import { environment } from '../../../environments/environment';
import { Certification } from '../models/certification.model';

describe('CertificationService', () => {
  let service: CertificationService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiGatewayUrl}/certifications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CertificationService]
    });
    service = TestBed.inject(CertificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCertifications should GET with query params', () => {
    const rows: Certification[] = [{ id: 1, name: 'AWS' }];
    service.getCertifications('aws', 'name', 'desc').subscribe((data) => {
      expect(data).toEqual(rows);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('search') === 'aws' &&
        r.params.get('sortBy') === 'name' &&
        r.params.get('direction') === 'desc'
    );
    expect(req.request.method).toBe('GET');
    req.flush(rows);
  });

  it('getCertifications should omit empty search param', () => {
    service.getCertifications('', 'id', 'asc').subscribe((rows) => expect(rows).toEqual([]));

    const req = httpMock.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('sortBy') === 'id' &&
        r.params.get('direction') === 'asc' &&
        r.params.get('search') === null
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('addCertification should POST body', () => {
    const body: Certification = { name: 'New', validityDays: 365 };
    const created: Certification = { id: 5, ...body };
    service.addCertification(body).subscribe((res) => expect(res).toEqual(created));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(created);
  });

  it('updateCertification should PUT', () => {
    const body: Certification = { name: 'Upd' };
    service.updateCertification(2, body).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/2`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 2, ...body });
  });

  it('deleteCertification should DELETE', () => {
    service.deleteCertification(3).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
