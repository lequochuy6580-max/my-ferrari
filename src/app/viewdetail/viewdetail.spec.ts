import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Viewdetail } from './viewdetail';

describe('Viewdetail', () => {
  let component: Viewdetail;
  let fixture: ComponentFixture<Viewdetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viewdetail],
    }).compileComponents();

    fixture = TestBed.createComponent(Viewdetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
