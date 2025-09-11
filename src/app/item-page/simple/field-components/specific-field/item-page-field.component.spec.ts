import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_CONFIG } from '@dspace/config';
import {
  BrowseService,
  BrowseDefinitionDataService,
  Item,
  MathService,
  MetadataMap,
  MetadataValue,
  BrowseDefinitionDataServiceStub,
  BrowseServiceStub,
  TranslateLoaderMock,
  createPaginatedList,
  createSuccessfulRemoteDataObject$,
} from '@dspace/core'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { MarkdownDirective } from '../../../../shared/utils/markdown.directive';
import {
  MetadataValuesComponent,
} from '../../../field-components/metadata-values/metadata-values.component';
import { ItemPageFieldComponent } from './item-page-field.component';

let comp: ItemPageFieldComponent;
let fixture: ComponentFixture<ItemPageFieldComponent>;
let markdownSpy;

const mockValue = 'test value';
const mockField = 'dc.test';
const mockLabel = 'test label';
const mockAuthorField = 'dc.contributor.author';
const mockDateIssuedField = 'dc.date.issued';
const mockFields = [mockField, mockAuthorField, mockDateIssuedField];

describe('ItemPageFieldComponent', () => {

  let appConfig = Object.assign({}, environment, {
    markdown: {
      enabled: false,
      mathjax: false,
    },
  });

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        ItemPageFieldComponent, MetadataValuesComponent,
      ],
      providers: [
        { provide: APP_CONFIG, useValue: appConfig },
        { provide: BrowseDefinitionDataService, useValue: BrowseDefinitionDataServiceStub },
        { provide: BrowseService, useValue: BrowseServiceStub },
        { provide: MathService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemPageFieldComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
    markdownSpy = spyOn(MarkdownDirective.prototype, 'render');
    fixture = TestBed.createComponent(ItemPageFieldComponent);
    comp = fixture.componentInstance;
    comp.item = mockItemWithMetadataFieldsAndValue(mockFields, mockValue);
    comp.fields = mockFields;
    comp.label = mockLabel;
    fixture.detectChanges();
  }));

  it('should display display the correct metadata value', () => {
    expect(fixture.nativeElement.innerHTML).toContain(mockValue);
  });

  describe('when markdown is disabled in the environment config', () => {
    beforeEach( () => {
      appConfig.markdown.enabled = false;
    });

    describe('and markdown is disabled in this component', () => {

      beforeEach(() => {
        comp.enableMarkdown = false;
        fixture.detectChanges();
      });

      it('should not use the Markdown Pipe', () => {
        expect(markdownSpy).not.toHaveBeenCalled();
      });
    });

    describe('and markdown is enabled in this component', () => {

      beforeEach(() => {
        comp.enableMarkdown = true;
        fixture.detectChanges();
      });

      it('should not use the Markdown Pipe', () => {
        expect(markdownSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('when markdown is enabled in the environment config', () => {
    beforeEach(() => {
      appConfig.markdown.enabled = true;
    });

    describe('and markdown is disabled in this component', () => {

      beforeEach(() => {
        comp.enableMarkdown = false;
        fixture.detectChanges();
      });

      it('should not use the Markdown Pipe', () => {
        expect(markdownSpy).not.toHaveBeenCalled();
      });
    });

    describe('and markdown is enabled in this component', () => {

      beforeEach(() => {
        comp.enableMarkdown = true;
        fixture.detectChanges();
      });

      it('should use the Markdown Pipe', () => {
        expect(markdownSpy).toHaveBeenCalled();
      });
    });

  });

  describe('test rendering of configured browse links', () => {
    beforeEach(() => {
      appConfig.markdown.enabled = false;
      comp.enableMarkdown = true;
      fixture.detectChanges();
    });

    it('should have a browse link', async () => {
      expect(fixture.debugElement.query(By.css('a.ds-browse-link')).nativeElement.innerHTML).toContain(mockValue);
    });
  });

  describe('test rendering of configured regex-based links', () => {
    beforeEach(() => {
      comp.urlRegex = '^test';
      fixture.detectChanges();
    });

    it('should have a rendered (non-browse) link since the value matches ^test', () => {
      expect(fixture.debugElement.query(By.css('a.ds-simple-metadata-link')).nativeElement.innerHTML).toContain(mockValue);
    });
  });

  describe('test skipping of configured links that do NOT match regex', () => {
    beforeEach(() => {
      comp.urlRegex = '^nope';
      fixture.detectChanges();
    });

    it('should NOT have a rendered (non-browse) link since the value matches ^test', () => {
      expect(fixture.debugElement.query(By.css('a.ds-simple-metadata-link'))).toBeNull();
    });
  });
});

export function mockItemWithMetadataFieldsAndValue(fields: string[], value: string): Item {
  const item = Object.assign(new Item(), {
    bundles: createSuccessfulRemoteDataObject$(createPaginatedList([])),
    metadata: new MetadataMap(),
  });
  fields.forEach((field: string) => {
    item.metadata[field] = [{
      language: 'en_US',
      value: value,
    }] as MetadataValue[];
  });
  return item;
}
