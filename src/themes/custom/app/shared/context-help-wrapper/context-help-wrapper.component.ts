import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContextHelpWrapperComponent as BaseComponent } from '../../../../../app/shared/context-help-wrapper/context-help-wrapper.component';
import { ContextHelpService } from '../../../../../app/shared/context-help.service';

/**
 * This component renders an info icon next to the wrapped element which
 * produces a tooltip when clicked.
 */
@Component({
  selector: 'ds-context-help-wrapper',
  // templateUrl: './context-help-wrapper.component.html',
  templateUrl: '../../../../../app/shared/context-help-wrapper/context-help-wrapper.component.html',
  // styleUrls: ['./context-help-wrapper.component.scss'],
  styleUrls: ['../../../../../app/shared/context-help-wrapper/context-help-wrapper.component.scss'],
})
export class ContextHelpWrapperComponent extends BaseComponent {
  constructor(
    protected translateService: TranslateService,
    protected contextHelpService: ContextHelpService
  ) {
    super(translateService, contextHelpService);
  }

}
