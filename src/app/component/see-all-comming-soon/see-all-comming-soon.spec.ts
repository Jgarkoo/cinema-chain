import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeeAllCommingSoon } from './see-all-comming-soon';

describe('SeeAllCommingSoon', () => {
  let component: SeeAllCommingSoon;
  let fixture: ComponentFixture<SeeAllCommingSoon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeeAllCommingSoon],
    }).compileComponents();

    fixture = TestBed.createComponent(SeeAllCommingSoon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
