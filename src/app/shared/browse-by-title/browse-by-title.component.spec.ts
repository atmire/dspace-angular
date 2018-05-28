import { BrowseByTitleComponent } from './browse-by-title.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Observable } from 'rxjs/Observable';

describe('BrowseByTitleComponent', () => {
  let comp: BrowseByTitleComponent;
  let fixture: ComponentFixture<BrowseByTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [BrowseByTitleComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseByTitleComponent);
    comp = fixture.componentInstance;
  });

  it('should display a loading message when objects is empty',() => {
    (comp as any).objects = undefined;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('ds-loading'))).toBeDefined();
  });

  it('should display results when objects is not empty', () => {
    (comp as any).objects = Observable.of({
      payload: {
        page: {
          length: 1
        }
      }
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('ds-viewable-collection'))).toBeDefined();
  });

});
