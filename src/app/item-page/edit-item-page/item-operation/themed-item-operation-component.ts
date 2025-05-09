import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../../../shared/theme-support/themed.component';
import { ItemOperationComponent } from './item-operation.component';
import { ItemOperation } from './itemOperation.model';

@Component({
  selector: 'ds-themed-item-operation',
  templateUrl: '../../../shared/theme-support/themed.component.html',
})
export class ThemedItemOperationComponent extends ThemedComponent<ItemOperationComponent> {
  @Input() operation: ItemOperation;

  inAndOutputNames: (keyof ItemOperationComponent & keyof this)[] = ['operation'];

  protected getComponentName(): string {
    return 'ItemOperationComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../themes/${themeName}/app/item-page/edit-item-page/item-operation/item-operation.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import('./item-operation.component');
  }
}
