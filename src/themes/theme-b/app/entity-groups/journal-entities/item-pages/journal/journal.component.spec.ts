import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { GenericItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { RemoteDataBuildService } from '../../../../../../../app/core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../../../../../../app/core/cache/object-cache.service';
import { BitstreamDataService } from '../../../../../../../app/core/data/bitstream-data.service';
import { CommunityDataService } from '../../../../../../../app/core/data/community-data.service';
import { DefaultChangeAnalyzer } from '../../../../../../../app/core/data/default-change-analyzer.service';
import { DSOChangeAnalyzer } from '../../../../../../../app/core/data/dso-change-analyzer.service';
import { ItemDataService } from '../../../../../../../app/core/data/item-data.service';
import { buildPaginatedList } from '../../../../../../../app/core/data/paginated-list.model';
import { RelationshipService } from '../../../../../../../app/core/data/relationship.service';
import { RemoteData } from '../../../../../../../app/core/data/remote-data';
import { Bitstream } from '../../../../../../../app/core/shared/bitstream.model';
import { HALEndpointService } from '../../../../../../../app/core/shared/hal-endpoint.service';
import { Item } from '../../../../../../../app/core/shared/item.model';
import { PageInfo } from '../../../../../../../app/core/shared/page-info.model';
import { UUIDService } from '../../../../../../../app/core/shared/uuid.service';
import { isNotEmpty } from '../../../../../../../app/shared/empty.util';
import { TranslateLoaderMock } from '../../../../../../../app/shared/mocks/translate-loader.mock';
import { NotificationsService } from '../../../../../../../app/shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../../../app/shared/remote-data.utils';
import { TruncatableService } from '../../../../../../../app/shared/truncatable/truncatable.service';
import { TruncatePipe } from '../../../../../../../app/shared/utils/truncate.pipe';
import { JournalComponent } from './journal.component';
import {RouteService} from '../../../../../../../app/core/services/route.service';

let comp: JournalComponent;
let fixture: ComponentFixture<JournalComponent>;

const mockItem: Item = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
  metadata: {
    'creativeworkseries.issn': [
      {
        language: 'en_US',
        value: '1234'
      }
    ],
    'creativework.publisher': [
      {
        language: 'en_US',
        value: 'a publisher'
      }
    ],
    'dc.description': [
      {
        language: 'en_US',
        value: 'desc'
      }
    ]
  }
});

describe('JournalComponent', () => {
  const mockBitstreamDataService = {
    getThumbnailFor(item: Item): Observable<RemoteData<Bitstream>> {
      return createSuccessfulRemoteDataObject$(new Bitstream());
    }
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [JournalComponent, GenericItemPageFieldComponent, TruncatePipe],
      providers: [
        { provide: ItemDataService, useValue: {} },
        { provide: TruncatableService, useValue: {} },
        { provide: RelationshipService, useValue: {} },
        { provide: ObjectCacheService, useValue: {} },
        { provide: UUIDService, useValue: {} },
        { provide: Store, useValue: {} },
        { provide: RemoteDataBuildService, useValue: {} },
        { provide: CommunityDataService, useValue: {} },
        { provide: HALEndpointService, useValue: {} },
        { provide: HttpClient, useValue: {} },
        { provide: DSOChangeAnalyzer, useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: DefaultChangeAnalyzer, useValue: {} },
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
        { provide: RouteService, useValue: {} }
      ],

      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(JournalComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(JournalComponent);
    comp = fixture.componentInstance;
    comp.object = mockItem;
    fixture.detectChanges();
  }));

  // for (const key of Object.keys(mockItem.metadata)) {
  //   it(`should be calling a component with metadata field ${key}`, () => {
  //     const fields = fixture.debugElement.queryAll(By.css('.item-page-fields'));
  //     expect(containsFieldInput(fields, key)).toBeTruthy();
  //   });
  // }
});

function containsFieldInput(fields: DebugElement[], metadataKey: string): boolean {
  for (const field of fields) {
    const fieldComp = field.componentInstance;
    if (isNotEmpty(fieldComp.fields)) {
      if (fieldComp.fields.indexOf(metadataKey) > -1) {
        return true;
      }
    }
  }
  return false;
}
