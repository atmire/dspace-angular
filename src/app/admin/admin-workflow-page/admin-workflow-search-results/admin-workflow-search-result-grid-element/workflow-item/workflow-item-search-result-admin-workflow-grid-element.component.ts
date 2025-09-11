import { Component, ComponentRef, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  DSONameService,
  LinkService,
  BitstreamDataService,
  RemoteData,
  Context,
  followLink,
  GenericConstructor,
  Item,
  WorkflowItemSearchResult,
  getAllSucceededRemoteData,
  getRemoteDataPayload,
  ViewMode,
  WorkflowItem,
} from '@dspace/core'
import { hasValue } from '@dspace/utils';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  DynamicComponentLoaderDirective,
} from '../../../../../shared/abstract-component-loader/dynamic-component-loader.directive';
import {
  getListableObjectComponent,
  listableObjectComponent,
} from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import {
  SearchResultGridElementComponent,
} from '../../../../../shared/object-grid/search-result-grid-element/search-result-grid-element.component';
import { ThemeService } from '../../../../../shared/theme-support/theme.service';
import { TruncatableService } from '../../../../../shared/truncatable/truncatable.service';
import {
  WorkflowItemAdminWorkflowActionsComponent,
} from '../../actions/workflow-item/workflow-item-admin-workflow-actions.component';

@listableObjectComponent(WorkflowItemSearchResult, ViewMode.GridElement, Context.AdminWorkflowSearch)
@Component({
  selector: 'ds-workflow-item-search-result-admin-workflow-grid-element',
  styleUrls: ['./workflow-item-search-result-admin-workflow-grid-element.component.scss'],
  templateUrl: './workflow-item-search-result-admin-workflow-grid-element.component.html',
  standalone: true,
  imports: [
    DynamicComponentLoaderDirective,
    TranslateModule,
    WorkflowItemAdminWorkflowActionsComponent,
  ],
})
/**
 * The component for displaying a grid element for an workflow item on the admin workflow search page
 */
export class WorkflowItemSearchResultAdminWorkflowGridElementComponent extends SearchResultGridElementComponent<WorkflowItemSearchResult, WorkflowItem> implements OnDestroy, OnInit {
  /**
   * Directive used to render the dynamic component in
   */
  @ViewChild(DynamicComponentLoaderDirective, { static: true }) dynamicComponentLoaderDirective: DynamicComponentLoaderDirective;

  /**
   * The html child that contains the badges html
   */
  @ViewChild('badges', { static: true }) badges: ElementRef;

  /**
   * The html child that contains the button html
   */
  @ViewChild('buttons', { static: true }) buttons: ElementRef;

  /**
   * The item linked to the workflow item
   */
  public item$: Observable<Item>;

  protected compRef: ComponentRef<Component>;

  constructor(
    public dsoNameService: DSONameService,
    private linkService: LinkService,
    protected truncatableService: TruncatableService,
    private themeService: ThemeService,
    protected bitstreamDataService: BitstreamDataService,
  ) {
    super(dsoNameService, truncatableService, bitstreamDataService);
  }

  /**
   * Setup the dynamic child component
   * Initialize the item object from the workflow item
   */
  ngOnInit(): void {
    super.ngOnInit();
    this.dso = this.linkService.resolveLink(this.dso, followLink('item'));
    this.item$ = (this.dso.item as Observable<RemoteData<Item>>).pipe(getAllSucceededRemoteData(), getRemoteDataPayload());
    this.item$.pipe(take(1)).subscribe((item: Item) => {
      const component: GenericConstructor<Component> = this.getComponent(item);

      const viewContainerRef = this.dynamicComponentLoaderDirective.viewContainerRef;
      viewContainerRef.clear();

      this.compRef = viewContainerRef.createComponent(
        component, {
          index: 0,
          injector: undefined,
          projectableNodes: [
            [this.badges.nativeElement],
            [this.buttons.nativeElement],
          ],
        },
      );
      this.compRef.setInput('object', item);
      this.compRef.setInput('index', this.index);
      this.compRef.setInput('linkType', this.linkType);
      this.compRef.setInput('listID', this.listID);
      this.compRef.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (hasValue(this.compRef)) {
      this.compRef.destroy();
      this.compRef = undefined;
    }
  }

  /**
   * Fetch the component depending on the item's entity type, view mode and context
   * @returns {GenericConstructor<Component>}
   */
  private getComponent(item: Item): GenericConstructor<Component> {
    return getListableObjectComponent(item.getRenderTypes(), ViewMode.GridElement, undefined, this.themeService.getThemeName());
  }

}
