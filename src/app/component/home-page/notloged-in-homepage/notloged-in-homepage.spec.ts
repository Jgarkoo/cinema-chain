import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotlogedInHomepage } from './notloged-in-homepage';

describe('NotlogedInHomepage', () => {
  let component: NotlogedInHomepage;
  let fixture: ComponentFixture<NotlogedInHomepage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotlogedInHomepage],
    }).compileComponents();

    fixture = TestBed.createComponent(NotlogedInHomepage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
