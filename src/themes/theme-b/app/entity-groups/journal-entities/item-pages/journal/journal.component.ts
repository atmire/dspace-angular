import { Component } from '@angular/core';
import {
  listableObjectComponent,
  DEFAULT_CONTEXT
} from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import { ItemComponent } from '../../../../../../../app/item-page/simple/item-types/shared/item.component';

@listableObjectComponent('Journal', ViewMode.StandalonePage, DEFAULT_CONTEXT, 'theme-b')
@Component({
  selector: 'ds-journal',
  styleUrls: ['./journal.component.scss'],
  templateUrl: './journal.component.html'
})
/**
 * The component for displaying metadata and relations of an item of the type Journal
 */
export class JournalComponent extends ItemComponent {
}
