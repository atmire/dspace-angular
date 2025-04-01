import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../../../shared/theme-support/themed.component';
import { RelatedItemsComponent } from './related-items-component';
import { Item } from '../../../core/shared/item.model';
import { FindListOptions } from '../../../core/data/find-list-options.model';

@Component({
  selector: 'ds-themed-related-items',
  templateUrl: '../../../shared/theme-support/themed.component.html'
})
export class ThemedRelatedItemsComponent extends ThemedComponent<RelatedItemsComponent> {

  @Input() parentItem: Item;
  @Input() relationType: string;
  @Input() incrementBy;
  @Input() options = new FindListOptions();
  @Input() label: string;

  protected inAndOutputNames: (keyof RelatedItemsComponent & keyof this)[] = [
    'parentItem',
    'relationType',
    'incrementBy',
    'options',
    'label'
  ];

  protected getComponentName(): string {
    return 'RelatedItemsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../themes/${themeName}/app/item-page/simple/related-items/related-items-component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./related-items-component`);
  }

}
