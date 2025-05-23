import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ItemOperationComponent as BaseComponent } from '../../../../../../app/item-page/edit-item-page/item-operation/item-operation.component';
import { BtnDisabledDirective } from '../../../../../../app/shared/btn-disabled.directive';

@Component({
  selector: 'ds-item-operation',
  templateUrl: './item-operation.component.html',
  imports: [
    BtnDisabledDirective,
    NgbTooltipModule,
    RouterLink,
    TranslateModule,
  ],
  standalone: true,
})
/**
 * Operation that can be performed on an item
 */
export class ItemOperationComponent extends BaseComponent {
}
