import { Component } from '@angular/core';

import { RelatedItemsComponent as BaseComponent } from '../../../../../../app/item-page/simple/related-items/related-items-component';

@Component({
  selector: 'ds-themed-related-items',
  templateUrl: '../../../../../../app/item-page/simple/related-items/related-items.component.html',
  // styleUrls: ['./related-items.component.scss'],
  styleUrls: ['../../../../../../app/item-page/simple/related-items/related-items.component.scss'],
  standalone: true,
})
export class RelatedItemsComponent extends BaseComponent {

}
