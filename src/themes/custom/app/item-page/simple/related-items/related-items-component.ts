import {
  AsyncPipe,
  NgClass,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { RelatedItemsComponent as BaseComponent } from '../../../../../../app/item-page/simple/related-items/related-items-component';
import { ThemedLoadingComponent } from '../../../../../../app/shared/loading/themed-loading.component';
import { MetadataFieldWrapperComponent } from '../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { ListableObjectComponentLoaderComponent } from '../../../../../../app/shared/object-collection/shared/listable-object/listable-object-component-loader.component';
import { VarDirective } from '../../../../../../app/shared/utils/var.directive';

@Component({
  selector: 'ds-themed-related-items',
  templateUrl: '../../../../../../app/item-page/simple/related-items/related-items.component.html',
  // styleUrls: ['./related-items.component.scss'],
  styleUrls: ['../../../../../../app/item-page/simple/related-items/related-items.component.scss'],
  standalone: true,
  imports: [MetadataFieldWrapperComponent, NgClass, VarDirective, ListableObjectComponentLoaderComponent, ThemedLoadingComponent, AsyncPipe, TranslateModule],
})
export class RelatedItemsComponent extends BaseComponent {

}
