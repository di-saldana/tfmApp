import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatRoomsPage } from './chat-rooms.page';

describe('ChatRoomsPage', () => {
  let component: ChatRoomsPage;
  let fixture: ComponentFixture<ChatRoomsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatRoomsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
