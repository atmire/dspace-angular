import { AsyncPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@dspace/config';
import {
  DSONameService,
  LinkService,
  PaginatedList,
  RemoteData,
  Context,
  DSpaceObject,
  followLink,
  Item,
  WorkspaceItemSearchResult,
  getFirstCompletedRemoteData,
  getRemoteDataPayload,
  ViewMode,
  WorkspaceItem,
  SupervisionOrder,
  SupervisionOrderDataService,
} from '@dspace/core'
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap, take, tap } from 'rxjs/operators';

import {
  listableObjectComponent,
} from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import {
  ListableObjectComponentLoaderComponent,
} from '../../../../../shared/object-collection/shared/listable-object/listable-object-component-loader.component';
import {
  SearchResultListElementComponent,
} from '../../../../../shared/object-list/search-result-list-element/search-result-list-element.component';
import { TruncatableService } from '../../../../../shared/truncatable/truncatable.service';
import {
  WorkspaceItemAdminWorkflowActionsComponent,
} from '../../actions/workspace-item/workspace-item-admin-workflow-actions.component';

@listableObjectComponent(WorkspaceItemSearchResult, ViewMode.ListElement, Context.AdminWorkflowSearch)
@Component({
  selector: 'ds-workflow-item-search-result-admin-workflow-list-element',
  styleUrls: ['./workspace-item-search-result-admin-workflow-list-element.component.scss'],
  templateUrl: './workspace-item-search-result-admin-workflow-list-element.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    ListableObjectComponentLoaderComponent,
    TranslateModule,
    WorkspaceItemAdminWorkflowActionsComponent,
  ],
})
/**
 * The component for displaying a list element for a workflow item on the admin workflow search page
 */
export class WorkspaceItemSearchResultAdminWorkflowListElementComponent extends SearchResultListElementComponent<WorkspaceItemSearchResult, WorkspaceItem> implements OnInit {

  /**
   * The item linked to the workflow item
   */
  public item$: BehaviorSubject<Item> = new BehaviorSubject<Item>(undefined);

  /**
   * The id of the item linked to the workflow item
   */
  public itemId: string;

  /**
   * The supervision orders linked to the workflow item
   */
  public supervisionOrder$: BehaviorSubject<SupervisionOrder[]> = new BehaviorSubject<SupervisionOrder[]>([]);

  constructor(private linkService: LinkService,
              public dsoNameService: DSONameService,
              protected supervisionOrderDataService: SupervisionOrderDataService,
              protected truncatableService: TruncatableService,
              @Inject(APP_CONFIG) protected appConfig: AppConfig,
  ) {
    super(truncatableService, dsoNameService, appConfig);
  }

  /**
   * Initialize the item object from the workflow item
   */
  ngOnInit(): void {
    super.ngOnInit();
    this.dso = this.linkService.resolveLink(this.dso, followLink('item'));
    const item$ = (this.dso.item as Observable<RemoteData<Item>>).pipe(getFirstCompletedRemoteData(), getRemoteDataPayload());

    item$.pipe(
      take(1),
      tap((item: Item) => {
        this.item$.next(item);
        this.itemId = item.id;
      }),
      mergeMap((item: Item) => this.retrieveSupervisorOrders(item.id)),
    ).subscribe((supervisionOrderList: SupervisionOrder[]) => {
      this.supervisionOrder$.next(supervisionOrderList);
    });
  }

  /**
   * Retrieve the list of SupervisionOrder object related to the given item
   *
   * @param itemId
   * @private
   */
  private retrieveSupervisorOrders(itemId): Observable<SupervisionOrder[]> {
    return this.supervisionOrderDataService.searchByItem(
      itemId, false, true, followLink('group'),
    ).pipe(
      getFirstCompletedRemoteData(),
      map((soRD: RemoteData<PaginatedList<SupervisionOrder>>) => soRD.hasSucceeded && !soRD.hasNoContent ? soRD.payload.page : []),
    );
  }

  /**
   * Reload list element after supervision order change.
   */
  reloadObject(dso: DSpaceObject) {
    this.reloadedObject.emit(dso);
  }

}
