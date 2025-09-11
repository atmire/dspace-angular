import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_CONFIG } from '@dspace/config';
import {
  DSONameService,
  Item,
  ItemSearchResult,
  ViewMode,
  DSONameServiceMock,
  mockTruncatableService,
} from '@dspace/core'
import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../../../../../environments/environment';
import {
  CollectionElementLinkType,
} from '../../../../../shared/object-collection/collection-element-link.type';
import {
  ListableObjectComponentLoaderComponent,
} from '../../../../../shared/object-collection/shared/listable-object/listable-object-component-loader.component';
import { TruncatableService } from '../../../../../shared/truncatable/truncatable.service';
import {
  ItemAdminSearchResultActionsComponent,
} from '../../item-admin-search-result-actions.component';
import {
  ItemAdminSearchResultListElementComponent,
} from './item-admin-search-result-list-element.component';

describe('ItemAdminSearchResultListElementComponent', () => {
  let component: ItemAdminSearchResultListElementComponent;
  let fixture: ComponentFixture<ItemAdminSearchResultListElementComponent>;
  let id;
  let searchResult;

  function init() {
    id = '780b2588-bda5-4112-a1cd-0b15000a5339';
    searchResult = new ItemSearchResult();
    searchResult.indexableObject = new Item();
    searchResult.indexableObject.uuid = id;
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        ItemAdminSearchResultListElementComponent,
      ],
      providers: [
        { provide: TruncatableService, useValue: mockTruncatableService },
        { provide: DSONameService, useClass: DSONameServiceMock },
        { provide: APP_CONFIG, useValue: environment },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ItemAdminSearchResultListElementComponent, {
        remove: { imports: [ListableObjectComponentLoaderComponent, ItemAdminSearchResultActionsComponent] },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemAdminSearchResultListElementComponent);
    component = fixture.componentInstance;
    component.object = searchResult;
    component.linkTypes = CollectionElementLinkType;
    component.index = 0;
    component.viewModes = ViewMode;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
