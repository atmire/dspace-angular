import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../+my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../../../../core/shared/search/search-configuration.service';
import { from as observableFrom, Observable } from 'rxjs';
import { ListableObject } from '../../../../../object-collection/shared/listable-object.model';
import { RemoteData } from '../../../../../../core/data/remote-data';
import { distinctUntilChanged, map, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { PaginationComponentOptions } from '../../../../../pagination/pagination-component-options.model';
import { buildPaginatedList, PaginatedList } from '../../../../../../core/data/paginated-list.model';
import { Router } from '@angular/router';
import { PaginatedSearchOptions } from '../../../../../search/paginated-search-options.model';
import { Context } from '../../../../../../core/shared/context.model';
import { createSuccessfulRemoteDataObject } from '../../../../../remote-data.utils';
import { PaginationService } from '../../../../../../core/pagination/pagination.service';
import { Item } from '../../../../../../core/shared/item.model';
import { RelationshipService } from '../../../../../../core/data/relationship.service';
import { Projection } from '../../../../../../core/shared/projection.model';
import { followLink } from '../../../../../utils/follow-link-config.model';
import { Relationship } from '../../../../../../core/shared/item-relationships/relationship.model';
import { getAllSucceededRemoteData, getFirstCompletedRemoteData } from '../../../../../../core/shared/operators';
import { RelationshipType } from '../../../../../../core/shared/item-relationships/relationship-type.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';
import { hasValue } from '../../../../../empty.util';
import { RelationshipOptions } from '../../../models/relationship-options.model';
import { SelectableListService } from '../../../../../object-list/selectable-list/selectable-list.service';
import { SearchResult } from '../../../../../search/search-result.model';
import { ItemSearchResult } from '../../../../../object-collection/shared/item-search-result.model';

@Component({
  selector: 'ds-dynamic-lookup-relation-selection-tab',
  styleUrls: ['./dynamic-lookup-relation-selection-tab.component.scss'],
  templateUrl: './dynamic-lookup-relation-selection-tab.component.html',
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ]
})

/**
 * Tab for inside the lookup modal that represents the currently selected relationships
 */
export class DsDynamicLookupRelationSelectionTabComponent implements OnDestroy {
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

  /**
   * Is the selection repeatable?
   */
  @Input() repeatable: boolean;

  /**
   * The paginated list of selected items
   */
  @Input() selectionRD$: BehaviorSubject<RemoteData<PaginatedList<ListableObject>>> = new BehaviorSubject(undefined);

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
   * The initial pagination to use
   */
  initialPagination = Object.assign(new PaginationComponentOptions(), {
    id: 'spc',
    pageSize: 5
  });

  /**
   * The current pagination options
   */
  currentPagination$: Observable<PaginationComponentOptions>;

  private subs: Subscription[] = [];

  constructor(private router: Router,
              private searchConfigService: SearchConfigurationService,
              private paginationService: PaginationService,
              private relationshipService: RelationshipService,
              private selectableListService: SelectableListService,
  ) {
  }

  /**
   * Set up the selection and pagination on load
   */
  ngOnInit() {
    this.resetRoute();
    this.subs.push(
      this.searchConfigService.paginatedSearchOptions.pipe(
        map((options: PaginatedSearchOptions) => options.pagination),
        distinctUntilChanged(
          (a: PaginationComponentOptions, b: PaginationComponentOptions) =>
            a.pageSize === b.pageSize && a.currentPage === b.currentPage
        ),
        switchMap((pagination: PaginationComponentOptions) => {
          return this.relationshipService.getItemRelationshipsByLabel(
            this.item,
            this.relationshipType.relatedTypeLeft
              ? this.relationshipType.leftwardType
              : this.relationshipType.rightwardType,
            {
              elementsPerPage: pagination.pageSize,
              currentPage: pagination.currentPage,
              projections: [
                Projection.CheckSideItemInRelationShip(this.item),
              ],
            },
            true,
            true,
            followLink('leftItem'),
            followLink('rightItem'),
          );
        }),
        getAllSucceededRemoteData(),
        switchMap((paginatedListRd: RemoteData<PaginatedList<Relationship>>) =>
          observableFrom(paginatedListRd.payload.page).pipe(
            mergeMap((relationship: Relationship) => {
              // return the other Item in the relationship
              if (relationship.relatedItemLeft) {
                return relationship.rightItem.pipe(getFirstCompletedRemoteData());
              } else {
                return relationship.leftItem.pipe(getFirstCompletedRemoteData());
              }
            }),
            toArray(),
            map((rds: RemoteData<Item>[]) => {
              return createSuccessfulRemoteDataObject(
                buildPaginatedList(
                  paginatedListRd.payload.pageInfo,  // reuse pagination from PaginatedList<Relationship>
                  rds.map(itemRd => Object.assign(
                    new ItemSearchResult(),          // wrap in search results so (de)select methods don't break
                    { indexableObject: itemRd.payload, hitHighlights: {} }
                  ))
                )
              );
            })
          )
        ),
      ).subscribe((v) => {
        this.selectionRD$.next(v);
      })
    );
    this.currentPagination$ = this.paginationService.getCurrentPagination(
      this.searchConfigService.paginationID, this.initialPagination
    );
  }

  /**
   * Method to reset the route when the tab is opened to make sure no strange pagination issues appears
   */
  resetRoute() {
    this.paginationService.updateRoute(this.searchConfigService.paginationID, {
      page: 1,
      pageSize: 5
    });
  }

  public ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub))
             .forEach((sub) => sub.unsubscribe());
  }
}
