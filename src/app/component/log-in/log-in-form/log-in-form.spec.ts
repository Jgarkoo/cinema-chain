import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogInForm } from './log-in-form';

describe('LogInForm', () => {
  let component: LogInForm;
  let fixture: ComponentFixture<LogInForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogInForm],
    }).compileComponents();

    fixture = TestBed.createComponent(LogInForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
