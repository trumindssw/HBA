import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousrequestsComponent } from './previousrequests.component';

describe('PreviousrequestsComponent', () => {
  let component: PreviousrequestsComponent;
  let fixture: ComponentFixture<PreviousrequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviousrequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousrequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
