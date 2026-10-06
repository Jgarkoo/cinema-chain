import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommingSoon } from './comming-soon';

describe('CommingSoon', () => {
  let component: CommingSoon;
  let fixture: ComponentFixture<CommingSoon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommingSoon],
    }).compileComponents();

    fixture = TestBed.createComponent(CommingSoon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
