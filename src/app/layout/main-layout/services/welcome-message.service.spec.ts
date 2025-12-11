import { TestBed } from '@angular/core/testing';

import { WelcomeMessageService } from './welcome-message.service';

describe('WelcomeMessageService', () => {
  let service: WelcomeMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WelcomeMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
