import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  DSONameService,
  LinkService,
  ObjectCacheService,
  RemoteData,
  Context,
  followLink,
  Item,
  PoolTaskSearchResult,
  getFirstCompletedRemoteData,
  ViewMode,
  WorkflowItem,
  PoolTask,
} from '@dspace/core'
import { hasValue, isNotEmpty } from '@dspace/utils';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

import {
  PoolTaskActionsComponent,
} from '../../../mydspace-actions/pool-task/pool-task-actions.component';
import {
  listableObjectComponent,
} from '../../../object-collection/shared/listable-object/listable-object.decorator';
import { ItemDetailPreviewComponent } from '../item-detail-preview/item-detail-preview.component';
import { SearchResultDetailElementComponent } from '../search-result-detail-element.component';

/**
 * This component renders pool task object for the search result in the detail view.
 */
@Component({
  selector: 'ds-pool-search-result-detail-element',
  styleUrls: ['../search-result-detail-element.component.scss'],
  templateUrl: './pool-search-result-detail-element.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    ItemDetailPreviewComponent,
    PoolTaskActionsComponent,
  ],
})

@listableObjectComponent(PoolTaskSearchResult, ViewMode.DetailedListElement)
export class PoolSearchResultDetailElementComponent extends SearchResultDetailElementComponent<PoolTaskSearchResult, PoolTask> implements OnInit, OnDestroy  {

  /**
   * The item object that belonging to the result object
   */
  public item$: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);

  /**
   * A boolean representing if to show submitter information
   */
  public showSubmitter = true;

  /**
   * Represents the badge context
   */
  public badgeContext = Context.MyDSpaceWaitingController;

  /**
   * The workflowitem object that belonging to the result object
   */
  public workflowitem$: BehaviorSubject<WorkflowItem> = new BehaviorSubject<WorkflowItem>(null);

  constructor(
    public dsoNameService: DSONameService,
    protected linkService: LinkService,
    protected objectCache: ObjectCacheService,
  ) {
    super(dsoNameService);
  }

  /**
   * Initialize all instance variables
   */
  ngOnInit() {
    super.ngOnInit();
    this.linkService.resolveLinks(this.dso, followLink('workflowitem', {},
      followLink('item', {}, followLink('bundles')),
      followLink('submitter'),
    ), followLink('action'));

    (this.dso.workflowitem as Observable<RemoteData<WorkflowItem>>).pipe(
      getFirstCompletedRemoteData(),
      mergeMap((wfiRD: RemoteData<WorkflowItem>) => {
        if (wfiRD.hasSucceeded) {
          this.workflowitem$.next(wfiRD.payload);
          return (wfiRD.payload.item as Observable<RemoteData<Item>>).pipe(
            getFirstCompletedRemoteData(),
          );
        } else {
          return EMPTY;
        }
      }),
      tap((itemRD: RemoteData<Item>) => {
        if (isNotEmpty(itemRD) && itemRD.hasSucceeded) {
          this.item$.next(itemRD.payload);
        }
      }),
    ).subscribe();

  }

  ngOnDestroy() {
    // This ensures the object is removed from cache, when action is performed on task
    if (hasValue(this.dso)) {
      this.objectCache.remove(this.dso._links.workflowitem.href);
    }
  }

}
