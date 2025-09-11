import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@dspace/config';
import {
  DSONameService,
  LinkService,
  Context,
  followLink,
  Item,
  ItemSearchResult,
  WorkflowItemSearchResult,
  getFirstSucceededRemoteDataPayload,
  ViewMode,
  WorkflowItem,
} from '@dspace/core'
import { BehaviorSubject } from 'rxjs';

import { ThemedLoadingComponent } from '../../../loading/themed-loading.component';
import {
  WorkflowitemActionsComponent,
} from '../../../mydspace-actions/workflowitem/workflowitem-actions.component';
import { CollectionElementLinkType } from '../../../object-collection/collection-element-link.type';
import {
  listableObjectComponent,
} from '../../../object-collection/shared/listable-object/listable-object.decorator';
import {
  ListableObjectComponentLoaderComponent,
} from '../../../object-collection/shared/listable-object/listable-object-component-loader.component';
import { TruncatableService } from '../../../truncatable/truncatable.service';
import {
  SearchResultListElementComponent,
} from '../../search-result-list-element/search-result-list-element.component';

/**
 * This component renders workflowitem object for the search result in the list view.
 */
@Component({
  selector: 'ds-workflow-item-my-dspace-result-list-element',
  styleUrls: ['../../search-result-list-element/search-result-list-element.component.scss'],
  templateUrl: './workflow-item-search-result-list-element.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    ListableObjectComponentLoaderComponent,
    NgClass,
    ThemedLoadingComponent,
    WorkflowitemActionsComponent,
  ],
})

@listableObjectComponent(WorkflowItemSearchResult, ViewMode.ListElement)
export class WorkflowItemSearchResultListElementComponent extends SearchResultListElementComponent<WorkflowItemSearchResult, WorkflowItem> implements OnInit {
  LinkTypes = CollectionElementLinkType;

  ViewModes = ViewMode;

  /**
   * The item search result derived from the WorkspaceItemSearchResult
   */
  derivedSearchResult$: BehaviorSubject<ItemSearchResult> = new BehaviorSubject(undefined);

  /**
   * Represents the badge context
   */
  public badgeContext = Context.MyDSpaceWorkflow;

  /**
   * Display thumbnails if required by configuration
   */
  showThumbnails: boolean;

  constructor(
    protected truncatableService: TruncatableService,
    protected linkService: LinkService,
    public dsoNameService: DSONameService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
  ) {
    super(truncatableService, dsoNameService, appConfig);
  }

  /**
   * Initialize all instance variables
   */
  ngOnInit(): void {
    super.ngOnInit();
    this.deriveSearchResult();
    this.showThumbnails = this.appConfig.browseBy.showThumbnails;
  }

  private deriveSearchResult() {
    this.linkService.resolveLink(this.object.indexableObject, followLink('item'));
    this.object.indexableObject.item.pipe(
      getFirstSucceededRemoteDataPayload(),
    ).subscribe((item: Item) => {
      const result = new ItemSearchResult();
      this.derivedSearchResult$.next(Object.assign(new ItemSearchResult(), {
        indexableObject: item,
        hitHighlights: this.object.hitHighlights,
      }));
    });
  }
}
