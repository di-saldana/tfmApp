import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlidesIntroPage } from './slides-intro.page';

describe('SlidesIntroPage', () => {
  let component: SlidesIntroPage;
  let fixture: ComponentFixture<SlidesIntroPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SlidesIntroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
