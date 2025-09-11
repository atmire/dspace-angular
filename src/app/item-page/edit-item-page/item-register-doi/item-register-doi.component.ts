import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IdentifierDataService,
  ItemDataService,
  RemoteData,
  NotificationsService,
  getItemPageRoute,
  Identifier,
  Item,
  getFirstSucceededRemoteData,
} from '@dspace/core'
import { hasValue } from '@dspace/utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import {
  ModifyItemOverviewComponent,
} from '../modify-item-overview/modify-item-overview.component';
import {
  AbstractSimpleItemActionComponent,
} from '../simple-item-action/abstract-simple-item-action.component';

@Component({
  selector: 'ds-item-register-doi',
  templateUrl: './item-register-doi-component.html',
  imports: [
    AsyncPipe,
    ModifyItemOverviewComponent,
    RouterLink,
    TranslateModule,
  ],
  standalone: true,
})
/**
 * Component responsible for rendering the Item Register DOI page
 */
export class ItemRegisterDoiComponent extends AbstractSimpleItemActionComponent implements OnInit {

  protected messageKey = 'register-doi';
  doiToUpdateMessage = 'item.edit.' + this.messageKey + '.to-update';
  identifiers$: Observable<Identifier[]>;
  processing = false;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected itemDataService: ItemDataService,
              protected translateService: TranslateService,
              protected identifierDataService: IdentifierDataService) {
    super(route, router, notificationsService, itemDataService, translateService);
  }

  /**
   * Initialise component
   */
  ngOnInit(): void {
    this.itemRD$ = this.route.data.pipe(
      map((data) => data.dso),
      getFirstSucceededRemoteData(),
    )as Observable<RemoteData<Item>>;

    this.itemRD$.pipe(first()).subscribe((rd) => {
      this.item = rd.payload;
      this.itemPageRoute = getItemPageRoute(this.item);
      this.identifiers$ = this.identifierDataService.getIdentifierDataFor(this.item).pipe(
        map((identifierRD) => {
          if (identifierRD.statusCode !== 401 && hasValue(identifierRD.payload)) {
            return identifierRD.payload.identifiers;
          } else {
            return null;
          }
        }),
      );
    },
    );

    this.confirmMessage = 'item.edit.' + this.messageKey + '.confirm';
    this.cancelMessage = 'item.edit.' + this.messageKey + '.cancel';
    this.headerMessage = 'item.edit.' + this.messageKey + '.header';
    this.descriptionMessage = 'item.edit.' + this.messageKey + '.description';


  }

  /**
   * Perform the register DOI action to the item
   */
  performAction() {
    this.registerDoi();
  }

  /**
   * Request that a pending, minted or null DOI be queued for registration
   */
  registerDoi() {
    this.processing = true;
    this.identifierDataService.registerIdentifier(this.item, 'doi').subscribe(
      (response: RemoteData<Item>) => {
        if (response.hasCompleted) {
          this.processing = false;
          this.processRestResponse(response);
        }
      },
    );
  }

}
