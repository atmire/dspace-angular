import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Collection,
  Context,
  ExternalSource,
  Item,
  ListableObject,
  RelationshipOptions,
} from '@dspace/core'

import { ThemedComponent } from '../../../../../theme-support/themed.component';
import {
  DsDynamicLookupRelationExternalSourceTabComponent,
} from './dynamic-lookup-relation-external-source-tab.component';

@Component({
  selector: 'ds-dynamic-lookup-relation-external-source-tab',
  styleUrls: [],
  templateUrl: '../../../../../theme-support/themed.component.html',
  standalone: true,
  imports: [],
})
export class ThemedDynamicLookupRelationExternalSourceTabComponent extends ThemedComponent<DsDynamicLookupRelationExternalSourceTabComponent> {
  protected inAndOutputNames: (keyof DsDynamicLookupRelationExternalSourceTabComponent & keyof this)[] = ['label', 'listId',
    'item', 'collection', 'relationship', 'context', 'query', 'repeatable', 'importedObject', 'externalSource'];

  @Input() label: string;

  @Input() listId: string;

  @Input() item: Item;

  @Input() collection: Collection;

  @Input() relationship: RelationshipOptions;

  @Input() context: Context;

  @Input() query: string;

  @Input() repeatable: boolean;

  @Output() importedObject: EventEmitter<ListableObject> = new EventEmitter();

  @Input() externalSource: ExternalSource;

  protected getComponentName(): string {
    return 'DsDynamicLookupRelationExternalSourceTabComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../../../../themes/${themeName}/app/shared/form/builder/ds-dynamic-form-ui/relation-lookup-modal/external-source-tab/dynamic-lookup-relation-external-source-tab.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./dynamic-lookup-relation-external-source-tab.component`);
  }
}
