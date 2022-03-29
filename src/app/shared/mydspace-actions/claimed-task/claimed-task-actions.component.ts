import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { ClaimedTaskDataService } from '../../../core/tasks/claimed-task-data.service';
import { ClaimedTask } from '../../../core/tasks/models/claimed-task-object.model';
import { isNotUndefined } from '../../empty.util';
import { WorkflowItem } from '../../../core/submission/models/workflowitem.model';
import { RemoteData } from '../../../core/data/remote-data';
import { MyDSpaceActionsComponent } from '../mydspace-actions';
import { NotificationsService } from '../../notifications/notifications.service';
import { RequestService } from '../../../core/data/request.service';
import { SearchService } from '../../../core/shared/search/search.service';
import { WorkflowAction } from '../../../core/tasks/models/workflow-action-object.model';
import { WorkflowActionDataService } from '../../../core/data/workflow-action-data.service';
import { WORKFLOW_TASK_OPTION_RETURN_TO_POOL } from './return-to-pool/claimed-task-actions-return-to-pool.component';
import { getWorkflowItemViewRoute } from '../../../workflowitems-edit-page/workflowitems-edit-page-routing-paths';

/**
 * This component represents actions related to ClaimedTask object.
 */
@Component({
  selector: 'ds-claimed-task-actions',
  styleUrls: ['./claimed-task-actions.component.scss'],
  templateUrl: './claimed-task-actions.component.html',
})
export class ClaimedTaskActionsComponent
  extends MyDSpaceActionsComponent<ClaimedTask, ClaimedTaskDataService>
  implements OnInit
{
  /**
   * The ClaimedTask object
   */
  @Input() object: ClaimedTask;

  /**
   * The workflowitem object that belonging to the ClaimedTask object
   */
  public workflowitem$: Observable<WorkflowItem>;

  /**
   * The workflow action available for this task
   */
  public actionRD$: Observable<RemoteData<WorkflowAction>>;

  /**
   * The option used to render the "return to pool" component
   * Every claimed task contains this option
   */
  public returnToPoolOption = WORKFLOW_TASK_OPTION_RETURN_TO_POOL;

  /**
   * Initialize instance variables
   *
   * @param {Injector} injector
   * @param {Router} router
   * @param {NotificationsService} notificationsService
   * @param {TranslateService} translate
   * @param {SearchService} searchService
   * @param {RequestService} requestService
   * @param workflowActionService
   */
  constructor(
    protected injector: Injector,
    protected router: Router,
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
    protected searchService: SearchService,
    protected requestService: RequestService,
    protected workflowActionService: WorkflowActionDataService
  ) {
    super(
      ClaimedTask.type,
      injector,
      router,
      notificationsService,
      translate,
      searchService,
      requestService
    );
  }

  /**
   * Initialize objects
   */
  ngOnInit() {
    this.initObjects(this.object);
    this.initAction(this.object);
  }

  /**
   * Init the ClaimedTask and WorkflowItem objects
   *
   * @param {PoolTask} object
   */
  initObjects(object: ClaimedTask) {
    this.object = object;

    this.workflowitem$ = (
      this.object.workflowitem as Observable<RemoteData<WorkflowItem>>
    ).pipe(
      filter(
        (rd: RemoteData<WorkflowItem>) =>
          !rd.isRequestPending && isNotUndefined(rd.payload)
      ),
      map((rd: RemoteData<WorkflowItem>) => rd.payload),
      take(1)
    );
  }

  /**
   * Init the WorkflowAction
   *
   * @param object
   */
  initAction(object: ClaimedTask) {
    this.actionRD$ = object.action;
  }

  /**
   * Check if claimed task actions should display a view item button.
   * @param workflowAction
   */
  hasViewAction(workflowAction: WorkflowAction) {
    return !workflowAction?.options.includes('submit_edit_metadata');
  }

  /**
   * Get the workflowitem view route.
   */
  getWorkflowItemViewRoute(workflowitem: WorkflowItem): string {
    return getWorkflowItemViewRoute(workflowitem?.id);
  }
}
