import { ExternalSourceService } from './external-source.service';
import { SearchService } from '../shared/search/search.service';
import { concat, map, multicast, startWith, take, takeWhile } from 'rxjs/operators';
import { PaginatedSearchOptions } from '../../shared/search/paginated-search-options.model';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { RemoteData } from './remote-data';
import { PaginatedList } from './paginated-list';
import { SearchResult } from '../../shared/search/search-result.model';
import { DSpaceObject } from '../shared/dspace-object.model';
import { RelationshipOptions } from '../../shared/form/builder/models/relationship-options.model';
import { Observable } from 'rxjs/internal/Observable';
import { Item } from '../shared/item.model';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { getAllSucceededRemoteData, getRemoteDataPayload } from '../shared/operators';
import { Injectable } from '@angular/core';
import { ExternalSource } from '../shared/external-source.model';
import { ExternalSourceEntry } from '../shared/external-source-entry.model';

/**
 * A service for retrieving local and external entries information during a relation lookup
 */
@Injectable()
export class LookupRelationService {
  /**
   * The search config last used for retrieving local results
   */
  public searchConfig: PaginatedSearchOptions;

  /**
   * Pagination options for retrieving exactly one result
   */
  private singleResultOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'single-result-options',
    pageSize: 1
  });

  constructor(protected externalSourceService: ExternalSourceService,
              protected searchService: SearchService) {
  }

  /**
   * Retrieve the available local entries for a relationship
   * @param relationship    Relationship options
   * @param searchOptions   Search options to filter results
   * @param setSearchConfig Optionally choose if we should store the used search config in a local variable (defaults to true)
   */
  getLocalResults(relationship: RelationshipOptions, searchOptions: PaginatedSearchOptions, setSearchConfig = true): Observable<RemoteData<PaginatedList<SearchResult<Item>>>> {
    const newConfig = Object.assign(new PaginatedSearchOptions({}), searchOptions,
      { fixedFilter: relationship.filter, configuration: relationship.searchConfiguration }
    );
    if (setSearchConfig) {
      this.searchConfig = newConfig;
    }
    return this.searchService.search(newConfig).pipe(
      /* Make sure to only listen to the first x results, until loading is finished */
      /* TODO: in Rxjs 6.4.0 and up, we can replace this with takeWhile(predicate, true) - see https://stackoverflow.com/a/44644237 */
      multicast(
        () => new ReplaySubject(1),
        (subject) => subject.pipe(
          takeWhile((rd: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => rd.isLoading),
          concat(subject.pipe(take(1)))
        )
      ) as any
    )
  }

  /**
   * Calculate the total local entries available for the given relationship
   * @param relationship  Relationship options
   * @param searchOptions Search options to filter results
   */
  getTotalLocalResults(relationship: RelationshipOptions, searchOptions: PaginatedSearchOptions): Observable<number> {
    return this.getLocalResults(relationship, Object.assign(new PaginatedSearchOptions({}), searchOptions, { pagination: this.singleResultOptions }), false).pipe(
      getAllSucceededRemoteData(),
      getRemoteDataPayload(),
      map((results: PaginatedList<SearchResult<Item>>) => results.totalElements),
      startWith(0)
    );
  }

  /**
   * Calculate the total external entries available for a given external source
   * @param externalSource  External Source
   * @param searchOptions   Search options to filter results
   */
  getTotalExternalResults(externalSource: ExternalSource, searchOptions: PaginatedSearchOptions): Observable<number> {
    return this.externalSourceService.getExternalSourceEntries(externalSource.id, Object.assign(new PaginatedSearchOptions({}), searchOptions, { pagination: this.singleResultOptions })).pipe(
      getAllSucceededRemoteData(),
      getRemoteDataPayload(),
      map((results: PaginatedList<ExternalSourceEntry>) => results.totalElements),
      startWith(0)
    );
  }
}
