import { Component } from '@angular/core';
import {ContextHelpDirectiveInput} from '../../shared/context-help.directive';

/**
 * Component responsible for rendering the system wide Curation Task UI
 */
@Component({
  selector: 'ds-admin-curation-task',
  templateUrl: './admin-curation-tasks.component.html',
})
export class AdminCurationTasksComponent {
  contextHelp = {
    content: 'context.help.admin-curation-tasks',
    id: 'admin-curation-tasks',
    iconPlacement: 'right',
    tooltipPlacement: ['right', 'bottom']
  } as ContextHelpDirectiveInput;

}
