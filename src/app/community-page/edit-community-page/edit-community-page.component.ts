import { Component } from '@angular/core';
import { Community } from '../../core/shared/community.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EditComColPageComponent } from '../../shared/comcol/comcol-forms/edit-comcol-page/edit-comcol-page.component';
import { getCommunityPageRoute } from '../community-page-routing-paths';
import {ContextHelpDirectiveInput} from '../../shared/context-help.directive';

/**
 * Component that represents the page where a user can edit an existing Community
 */
@Component({
  selector: 'ds-edit-community',
  templateUrl: '../../shared/comcol/comcol-forms/edit-comcol-page/edit-comcol-page.component.html'
})
export class EditCommunityPageComponent extends EditComColPageComponent<Community> {
  contextHelp = {
    content: 'context.help.edit-community',
    id: 'edit-community',
    iconPlacement: 'right',
    tooltipPlacement: ['right', 'bottom']
  } as ContextHelpDirectiveInput;

  type = 'community';

  public constructor(
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    super(router, route);
  }

  /**
   * Get the community page url
   * @param community The community for which the url is requested
   */
  getPageUrl(community: Community): string {
    return getCommunityPageRoute(community.id);
  }
}
