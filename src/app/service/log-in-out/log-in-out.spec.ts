import { TestBed } from '@angular/core/testing';
import { LogInOut } from './log-in-out';

describe('LogInOut', () => {
  let service: LogInOut;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogInOut);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
