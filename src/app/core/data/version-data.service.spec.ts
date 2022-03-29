import { HttpClient } from '@angular/common/http';
import { of as observableOf } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { NotificationsService } from '../../shared/notifications/notifications.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { RequestService } from './request.service';
import { PageInfo } from '../shared/page-info.model';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '../../shared/remote-data.utils';
import { RequestEntry } from './request.reducer';
import { HrefOnlyDataService } from './href-only-data.service';
import { getMockHrefOnlyDataService } from '../../shared/mocks/href-only-data.service.mock';

import { Store } from '@ngrx/store';
import { CoreState } from '../core.reducers';
import { RestResponse } from '../cache/response.models';
import { cold, getTestScheduler, hot } from 'jasmine-marbles';
import { Item } from '../shared/item.model';
import { VersionDataService } from './version-data.service';
import { Version } from '../shared/version.model';
import { VersionHistory } from '../shared/version-history.model';
import { followLink } from '../../shared/utils/follow-link-config.model';

describe('VersionDataService test', () => {
  let scheduler: TestScheduler;
  let service: VersionDataService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let hrefOnlyDataService: HrefOnlyDataService;
  let responseCacheEntry: RequestEntry;

  const item = Object.assign(new Item(), {
    id: '1234-1234',
    uuid: '1234-1234',
    bundles: observableOf({}),
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
  const itemRD = createSuccessfulRemoteDataObject(item);

  const versionHistory = Object.assign(new VersionHistory(), {
    id: '1',
    draftVersion: true,
  });

  const mockVersion: Version = Object.assign(new Version(), {
    item: createSuccessfulRemoteDataObject$(item),
    versionhistory: createSuccessfulRemoteDataObject$(versionHistory),
    version: 1,
  });
  const mockVersionRD = createSuccessfulRemoteDataObject(mockVersion);

  const endpointURL = `https://rest.api/rest/api/versioning/versions`;
  const findByIdRequestURL = `https://rest.api/rest/api/versioning/versions/${mockVersion.id}`;
  const findByIdRequestURL$ = observableOf(findByIdRequestURL);

  const requestUUID = '8b3c613a-5a4b-438b-9686-be1d5b4a1c5a';

  objectCache = {} as ObjectCacheService;
  const notificationsService = {} as NotificationsService;
  const http = {} as HttpClient;
  const comparator = {} as any;
  const comparatorEntry = {} as any;
  const store = {} as Store<CoreState>;
  const pageInfo = new PageInfo();

  function initTestService() {
    hrefOnlyDataService = getMockHrefOnlyDataService();
    return new VersionDataService(
      requestService,
      rdbService,
      store,
      objectCache,
      halService,
      notificationsService,
      http,
      comparatorEntry
    );
  }

  describe('', () => {
    beforeEach(() => {
      scheduler = getTestScheduler();

      halService = jasmine.createSpyObj('halService', {
        getEndpoint: cold('a', { a: endpointURL }),
      });
      responseCacheEntry = new RequestEntry();
      responseCacheEntry.request = { href: 'https://rest.api/' } as any;
      responseCacheEntry.response = new RestResponse(true, 200, 'Success');

      requestService = jasmine.createSpyObj('requestService', {
        generateRequestId: requestUUID,
        send: true,
        removeByHrefSubstring: {},
        getByHref: observableOf(responseCacheEntry),
        getByUUID: observableOf(responseCacheEntry),
      });
      rdbService = jasmine.createSpyObj('rdbService', {
        buildSingle: hot('(a|)', {
          a: mockVersionRD,
        }),
      });

      service = initTestService();

      spyOn(service as any, 'findByHref').and.callThrough();
      spyOn(service as any, 'getIDHrefObs').and.returnValue(
        findByIdRequestURL$
      );
    });

    afterEach(() => {
      service = null;
    });

    describe('getHistoryFromVersion', () => {
      it('should proxy the call to DataService.findByHref', () => {
        scheduler.schedule(() =>
          service.getHistoryFromVersion(mockVersion, true, true)
        );
        scheduler.flush();

        expect((service as any).findByHref).toHaveBeenCalledWith(
          findByIdRequestURL$,
          true,
          true,
          followLink('versionhistory')
        );
      });

      it('should return a VersionHistory', () => {
        const result = service.getHistoryFromVersion(mockVersion, true, true);
        const expected = cold('(a|)', {
          a: versionHistory,
        });
        expect(result).toBeObservable(expected);
      });

      it('should return an EMPTY observable when version is not given', () => {
        const result = service.getHistoryFromVersion(null);
        const expected = cold('|');
        expect(result).toBeObservable(expected);
      });
    });

    describe('getHistoryIdFromVersion', () => {
      it('should return the version history id', () => {
        spyOn(service as any, 'getHistoryFromVersion').and.returnValue(
          observableOf(versionHistory)
        );

        const result = service.getHistoryIdFromVersion(mockVersion);
        const expected = cold('(a|)', {
          a: versionHistory.id,
        });
        expect(result).toBeObservable(expected);
      });
    });
  });
});
