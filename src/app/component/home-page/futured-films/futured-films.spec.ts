import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FuturedFilms } from './futured-films';

describe('FuturedFilms', () => {
  let component: FuturedFilms;
  let fixture: ComponentFixture<FuturedFilms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuturedFilms],
    }).compileComponents();

    fixture = TestBed.createComponent(FuturedFilms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
