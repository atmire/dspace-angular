import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../+my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../../../../core/shared/search/search-configuration.service';
import { combineLatest, Observable, from as observableFrom } from 'rxjs';
import { ListableObject } from '../../../../../object-collection/shared/listable-object.model';
import { RemoteData } from '../../../../../../core/data/remote-data';
import { map, switchMap, take, tap, distinctUntilChanged, toArray, mergeMap } from 'rxjs/operators';
import { PaginationComponentOptions } from '../../../../../pagination/pagination-component-options.model';
import {
  buildPaginatedList,
  PaginatedList
} from '../../../../../../core/data/paginated-list.model';
import { Router } from '@angular/router';
import { PaginatedSearchOptions } from '../../../../../search/paginated-search-options.model';
import { Context } from '../../../../../../core/shared/context.model';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$
} from '../../../../../remote-data.utils';
import { PaginationService } from '../../../../../../core/pagination/pagination.service';
import { Item } from '../../../../../../core/shared/item.model';
import { RelationshipService } from '../../../../../../core/data/relationship.service';
import { Projection } from '../../../../../../core/shared/projection.model';
import { followLink } from '../../../../../utils/follow-link-config.model';
import { Relationship } from '../../../../../../core/shared/item-relationships/relationship.model';
import { PageInfo } from '../../../../../../core/shared/page-info.model';
import {
  getAllSucceededRemoteData,
  getFirstCompletedRemoteData
} from '../../../../../../core/shared/operators';
import { RelationshipType } from '../../../../../../core/shared/item-relationships/relationship-type.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

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
 * Tab for inside the lookup model that represents the currently selected relationships
 */
export class DsDynamicLookupRelationSelectionTabComponent {
  /**
   * The item we're adding relationships to
   */
  @Input() item: Item;

  /**
   * A string that describes the type of relationship
   */
  @Input() relationship: string;

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

  constructor(private router: Router,
              private searchConfigService: SearchConfigurationService,
              private paginationService: PaginationService,
              private relationshipService: RelationshipService,
  ) {
  }

  /**
   * Set up the selection and pagination on load
   */
  ngOnInit() {
    this.resetRoute();
    this.searchConfigService.paginatedSearchOptions.pipe(
      map((options: PaginatedSearchOptions) => options.pagination),
      distinctUntilChanged((a: PaginationComponentOptions, b: PaginationComponentOptions) => a.pageSize === b.pageSize && a.currentPage === b.currentPage),
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
            const items = buildPaginatedList(new PageInfo(), rds.map(itemRd => itemRd.payload));

            // reuse pagination info from original PaginatedList
            items.pageInfo = paginatedListRd.payload.pageInfo;

            return createSuccessfulRemoteDataObject(items);
          })
        )
      ),
    ).subscribe((v) => {  //TODO @yura track and destroy this subscribe
      this.selectionRD$.next(v);
    });
    this.currentPagination$ = this.paginationService.getCurrentPagination(
      this.searchConfigService.paginationID, this.initialPagination
    );
    // this.selectionRD$ = this.searchConfigService.paginatedSearchOptions
    //   .pipe(
    //     map((options: PaginatedSearchOptions) => options.pagination),
    //     switchMap((pagination: PaginationComponentOptions) => {
    //       return this.selection$.pipe(
    //         take(1),
    //         map((selected) => {
    //           const offset = (pagination.currentPage - 1) * pagination.pageSize;
    //           const end = (offset + pagination.pageSize) > selected.length ? selected.length : offset + pagination.pageSize;
    //           const selection = selected.slice(offset, end);
    //           const pageInfo = new PageInfo(
    //             {
    //               elementsPerPage: pagination.pageSize,
    //               totalElements: selected.length,
    //               currentPage: pagination.currentPage,
    //               totalPages: Math.ceil(selected.length / pagination.pageSize)
    //             });
    //           return createSuccessfulRemoteDataObject(buildPaginatedList(pageInfo, selection));
    //         })
    //       );
    //     })
    //   );
    // this.currentPagination$ = this.paginationService.getCurrentPagination(this.searchConfigService.paginationID, this.initialPagination);
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
}
