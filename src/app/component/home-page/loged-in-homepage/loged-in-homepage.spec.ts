import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogedInHomepage } from './loged-in-homepage';

describe('LogedInHomepage', () => {
  let component: LogedInHomepage;
  let fixture: ComponentFixture<LogedInHomepage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogedInHomepage],
    }).compileComponents();

    fixture = TestBed.createComponent(LogedInHomepage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
