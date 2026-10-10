import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeeAllNowPlaying } from './see-all-now-playing';

describe('SeeAllNowPlaying', () => {
  let component: SeeAllNowPlaying;
  let fixture: ComponentFixture<SeeAllNowPlaying>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeeAllNowPlaying],
    }).compileComponents();

    fixture = TestBed.createComponent(SeeAllNowPlaying);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
