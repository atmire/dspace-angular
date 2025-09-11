import { ChangeDetectionStrategy, Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  RequestService,
  NotificationsService,
  Item,
  WorkflowItem,
  WorkflowItemDataService,
  ActivatedRouteStub,
  NotificationsServiceStub,
  getMockRequestService,
  RouterStub,
  getMockSearchService,
  TranslateLoaderMock,
  createSuccessfulRemoteDataObject,
} from '@dspace/core'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SearchService } from '../../search/search.service';
import { WorkflowitemActionsComponent } from './workflowitem-actions.component';

let component: WorkflowitemActionsComponent;
let fixture: ComponentFixture<WorkflowitemActionsComponent>;

let mockObject: WorkflowItem;

const mockDataService = {};

const searchService = getMockSearchService();

const requestServce = getMockRequestService();

const item = Object.assign(new Item(), {
  bundles: of({}),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
    'dc.type': [
      {
        language: null,
        value: 'Article',
      },
    ],
    'dc.contributor.author': [
      {
        language: 'en_US',
        value: 'Smith, Donald',
      },
    ],
    'dc.date.issued': [
      {
        language: null,
        value: '2015-06-26',
      },
    ],
  },
});
const rd = createSuccessfulRemoteDataObject(item);
mockObject = Object.assign(new WorkflowItem(), { item: of(rd), id: '1234', uuid: '1234' });

describe('WorkflowitemActionsComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        WorkflowitemActionsComponent,
      ],
      providers: [
        { provide: Injector, useValue: {} },
        { provide: Router, useValue: new RouterStub() },
        { provide: WorkflowItemDataService, useValue: mockDataService },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: SearchService, useValue: searchService },
        { provide: RequestService, useValue: requestServce },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(WorkflowitemActionsComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowitemActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
  });

  it('should init object properly', () => {
    component.initObjects(mockObject);

    expect(component.object).toEqual(mockObject);
  });

  it('should display view button', () => {
    const btn = fixture.debugElement.query(By.css('button[data-test="view-btn"]'));

    expect(btn).not.toBeNull();
  });

});
