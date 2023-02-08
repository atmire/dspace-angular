import { Component } from '@angular/core';
import { ContextHelpToggleComponent as BaseComponent } from 'src/app/header/context-help-toggle/context-help-toggle.component';
import { ContextHelpService } from '../../../../../app/shared/context-help.service';

/**
 * Renders a "context help toggle" button that toggles the visibility of tooltip buttons on the page.
 * If there are no tooltip buttons available on the current page, the toggle is unclickable.
 */
@Component({
  selector: 'ds-context-help-toggle',
  // templateUrl: './context-help-toggle.component.html',
  templateUrl: '../../../../../app/header/context-help-toggle/context-help-toggle.component.html',
  // styleUrls: ['./context-help-toggle.component.scss']
  styleUrls: ['../../../../../app/header/context-help-toggle/context-help-toggle.component.scss']
})
export class ContextHelpToggleComponent extends BaseComponent {
  constructor(
    protected contextHelpService: ContextHelpService,
  ) {
    super(contextHelpService);
  }
}
