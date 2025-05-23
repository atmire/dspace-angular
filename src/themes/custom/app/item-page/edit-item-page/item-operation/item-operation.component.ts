import { Component } from '@angular/core';
import {
  ItemOperationComponent as BaseComponent
} from '../../../../../../app/item-page/edit-item-page/item-operation/item-operation.component';

@Component({
  selector: 'ds-item-operation',
  templateUrl: './item-operation.component.html'
})
/**
 * Operation that can be performed on an item
 */
export class ItemOperationComponent extends BaseComponent {
}
