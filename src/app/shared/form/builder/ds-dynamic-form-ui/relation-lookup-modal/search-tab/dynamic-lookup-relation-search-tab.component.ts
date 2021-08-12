import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../+my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../../../../core/shared/search/search-configuration.service';
import { Item } from '../../../../../../core/shared/item.model';
import { SearchResult } from '../../../../../search/search-result.model';
import { PaginatedList } from '../../../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../../../core/data/remote-data';
import { Observable } from 'rxjs';
import { RelationshipOptions } from '../../../models/relationship-options.model';
import { PaginationComponentOptions } from '../../../../../pagination/pagination-component-options.model';
import { ListableObject } from '../../../../../object-collection/shared/listable-object.model';
import { SearchService } from '../../../../../../core/shared/search/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectableListService } from '../../../../../object-list/selectable-list/selectable-list.service';
import { hasValue, isNotUndefined } from '../../../../../empty.util';
import { map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { getAllCompletedRemoteData, getFirstSucceededRemoteData } from '../../../../../../core/shared/operators';
import { RouteService } from '../../../../../../core/services/route.service';
import { CollectionElementLinkType } from '../../../../../object-collection/collection-element-link.type';
import { Context } from '../../../../../../core/shared/context.model';
import { LookupRelationService } from '../../../../../../core/data/lookup-relation.service';
import { PaginationService } from '../../../../../../core/pagination/pagination.service';
import { RelationshipType } from '../../../../../../core/shared/item-relationships/relationship-type.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { PaginatedSearchOptions } from '../../../../../search/paginated-search-options.model';
import { Projection } from '../../../../../../core/shared/projection.model';

@Component({
  selector: 'ds-dynamic-lookup-relation-search-tab',
  styleUrls: ['./dynamic-lookup-relation-search-tab.component.scss'],
  templateUrl: './dynamic-lookup-relation-search-tab.component.html',
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ]
})

/**
 * Tab for inside the lookup model that represents the items that can be used as a relationship in this submission
 */
export class DsDynamicLookupRelationSearchTabComponent implements OnInit, OnDestroy {
  /**
   * The item we're adding relationships to
   */
  @Input() item: Item;

  /**
   * The relationship type to show in this tab
   */
  @Input() relationshipOptions: RelationshipOptions;

  /**
   * The relationship type to show in this tab
   */
  @Input() relationshipType: RelationshipType;

  /**
   * The ID of the list to add/remove selected items to/from
   */
  @Input() listId: string;
  @Input() query: string;

  /**
   * Is the selection repeatable?
   */
  @Input() repeatable: boolean;

  /**
   * The context to display lists
   */
  @Input() context: Context;

  /**
   * Send an event to deselect an object from the list
   */
  @Output() deselectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  /**
   * Send an event to select an object from the list
   */
  @Output() selectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  /**
   * Search results
   */
  resultsRD$: Observable<RemoteData<PaginatedList<SearchResult<Item>>>>;

  /**
   * Are all results selected?
   */
  allSelected: boolean;

  /**
   * Are some results selected?
   */
  someSelected$: Observable<boolean>;

  /**
   * Is it currently loading to select all results?
   */
  selectAllLoading: boolean;

  /**
   * The initial pagination to use
   */
  initialPagination = {
    page: 1,
    pageSize: 5
  };

  /**
   * The type of links to display
   */
  linkTypes = CollectionElementLinkType;

  private subs: Subscription[] = [];

  constructor(
    private searchService: SearchService,
    private router: Router,
    private route: ActivatedRoute,
    private selectableListService: SelectableListService,
    public searchConfigService: SearchConfigurationService,
    private routeService: RouteService,
    public lookupRelationService: LookupRelationService,
    private paginationService: PaginationService
  ) {
  }

  /**
   * Sets up the pagination and fixed query parameters
   */
  ngOnInit(): void {
    this.resetRoute();
    this.routeService.setParameter('fixedFilterQuery', this.relationshipOptions.filter);
    this.routeService.setParameter('configuration', this.relationshipOptions.searchConfiguration);
    this.resultsRD$ = this.searchConfigService.paginatedSearchOptions.pipe(
      map((pso: PaginatedSearchOptions) => {
        if (isNotUndefined(this.item)) {
          return Object.assign(
            pso, {
            projections: [
              Projection.CheckRelatedItem(this.item),
            ]
          });
        }
        return pso;
      }),
      switchMap((options) =>
        this.lookupRelationService.getLocalResults(this.relationshipOptions, options).pipe(startWith(undefined))
      ),
      getAllCompletedRemoteData(),
    );
    this.subs.push(
      this.resultsRD$.subscribe((resultsRD: RemoteData<PaginatedList<SearchResult<Item>>>) => {
        const selectedResults = resultsRD.payload.page.filter(
          (sri: SearchResult<Item>) => sri.indexableObject.relatedItems?.includes(this.item.uuid)
        );

        this.selectableListService.select(this.listId, selectedResults);
      })
    );
  }

  /**
   * Method to reset the route when the window is opened to make sure no strange pagination issues appears
   */
  resetRoute() {
    this.paginationService.updateRoute(this.searchConfigService.paginationID, this.initialPagination);
  }

  /**
   * Selects a page in the store
   * @param page The page to select
   */
  selectPage(page: SearchResult<Item>[]) {
    this.resultsRD$
      .pipe(take(1), map(sriRD => sriRD?.payload?.page))
      .subscribe((selection: SearchResult<Item>[]) => {
        const filteredPage = page.filter(
          (pageItem) => selection.findIndex((selected) => selected.equals(pageItem)) < 0
        );
        this.selectObject.emit(...filteredPage);
      });
    this.selectableListService.select(this.listId, page);
  }

  /**
   * Deselects a page in the store
   * @param page the page to deselect
   */
  deselectPage(page: SearchResult<Item>[]) {
    this.allSelected = false;
    this.resultsRD$
        .pipe(take(1), map(sriRD => sriRD?.payload?.page))
        .subscribe((selection: SearchResult<Item>[]) => {
          const filteredPage = page.filter(
            (pageItem) => selection.findIndex((selected) => selected.equals(pageItem)) >= 0
          );
          this.deselectObject.emit(...filteredPage);
        });
    this.selectableListService.deselect(this.listId, page);
  }

  /**
   * Select all items that were found using the current search query
   */
  selectAll() {
    this.allSelected = true;
    this.selectAllLoading = true;
    const fullPagination = Object.assign(new PaginationComponentOptions(), {
      currentPage: 1,
      pageSize: 9999
    });
    const fullSearchConfig = Object.assign(this.lookupRelationService.searchConfig, { pagination: fullPagination });
    const results$ = this.searchService.search<Item>(fullSearchConfig);
    results$.pipe(
      getFirstSucceededRemoteData(),
      map((resultsRD) => resultsRD.payload.page),
      tap(() => this.selectAllLoading = false),
    ).subscribe((results) => {
      this.resultsRD$
          .pipe(take(1), map(sriRD => sriRD?.payload?.page))
          .subscribe((selection: SearchResult<Item>[]) => {
            const filteredResults = results.filter(
              (pageItem) => selection.findIndex((selected) => selected.equals(pageItem)) < 0
            );
            this.selectObject.emit(...filteredResults);
          });
        this.selectableListService.select(this.listId, results);
      }
    );
  }

  /**
   * Deselect all items
   */
  deselectAll() {
    this.allSelected = false;
    this.resultsRD$
        .pipe(take(1), map(sriRD => sriRD?.payload?.page))
        .subscribe((selection: SearchResult<Item>[]) => this.deselectObject.emit(...selection));
    this.selectableListService.deselectAll(this.listId);
  }

  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub))
             .forEach((sub) => sub.unsubscribe());
  }
}
