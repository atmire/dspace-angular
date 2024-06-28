import { Injectable } from '@angular/core';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { RequestService } from '../data/request.service';
import { ConfigDataService } from './config-data.service';
import { dataService } from '../data/base/data-service.decorator';
import { BULK_ACCESS_CONDITION_OPTIONS } from './models/config-type';
import { SearchDataImpl } from '../data/base/search-data';
import { RequestParam } from '../cache/models/request-param.model';
import { Observable } from 'rxjs';
import { hasValue } from '../../shared/empty.util';
import { RemoteData } from '../data/remote-data';
import { BulkAccessConditionOptions } from './models/bulk-access-condition-options.model';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';

/**
 * Data Service responsible for retrieving Bulk Access Condition Options from the REST API
 */
@Injectable({ providedIn: 'root' })
@dataService(BULK_ACCESS_CONDITION_OPTIONS)
export class BulkAccessConfigDataService extends ConfigDataService {
  private searchData: SearchDataImpl<BulkAccessConditionOptions>;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('bulkaccessconditionoptions', requestService, rdbService, objectCache, halService);
    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  searchByObjectOrName(uuid: string, name: string = 'default', useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<BulkAccessConditionOptions>[]): Observable<RemoteData<BulkAccessConditionOptions>> {
    const searchParams = [
      new RequestParam('name', name),
    ];
    if (hasValue(uuid)) {
      searchParams.push(new RequestParam('uuid', uuid))
    }
    const href$ = this.searchData.getSearchByHref('byObjectOrName',
      { searchParams },
      ...linksToFollow,
    );
    return this.searchData.findByHref(href$, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }
}
