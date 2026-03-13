import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Structures } from '../structures';

describe('Structures', () => {
  let component: Structures;
  let fixture: ComponentFixture<Structures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Structures],
    }).compileComponents();

    fixture = TestBed.createComponent(Structures);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
