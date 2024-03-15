import { Component } from '@angular/core';
import {ContextHelpDirectiveInput} from '../shared/context-help.directive';

/**
 * Page with title and the community list tree, as described in community-list.component;
 * navigated to with community-list.page.routing.module
 */
@Component({
  selector: 'ds-community-list-page',
  templateUrl: './community-list-page.component.html',
})
export class CommunityListPageComponent {
  contextHelp = {
    content: 'context.help.community-list-page',
    id: 'community-list-page',
    iconPlacement: 'right',
    tooltipPlacement: ['right', 'bottom']
  } as ContextHelpDirectiveInput;
}
