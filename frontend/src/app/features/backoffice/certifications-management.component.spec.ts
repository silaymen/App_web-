import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CertificationsManagementComponent } from './certifications-management.component';
import { environment } from '../../../environments/environment';

describe('CertificationsManagementComponent', () => {
  let fixture: ComponentFixture<CertificationsManagementComponent>;
  let httpMock: HttpTestingController;
  const listUrl = `${environment.apiGatewayUrl}/certifications`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationsManagementComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CertificationsManagementComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const init = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    init.flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load certifications after initial GET', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    req.flush([{ id: 1, name: 'Test', validityDays: 365 }]);
    fixture.detectChanges();

    expect(fixture.componentInstance.certifications.length).toBe(1);
    expect(fixture.componentInstance.certifications[0].name).toBe('Test');
    expect(fixture.nativeElement.textContent).toContain('Test');
  });
});
