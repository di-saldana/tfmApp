import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PossibleMatchesPage } from './possible-matches.page';

describe('PossibleMatchesPage', () => {
  let component: PossibleMatchesPage;
  let fixture: ComponentFixture<PossibleMatchesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PossibleMatchesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
