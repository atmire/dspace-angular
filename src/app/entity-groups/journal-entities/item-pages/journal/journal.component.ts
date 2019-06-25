import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../../../../core/shared/item.model';
import { ItemViewMode, rendersItemType } from '../../../../shared/items/item-type-decorator';
import { isNotEmpty } from '../../../../shared/empty.util';
import { ItemComponent } from '../../../../+item-page/simple/item-types/shared/item.component';
import {
  filterRelationsByTypeLabel,
  relationsToItems
} from '../../../../+item-page/simple/item-types/shared/item-relationships-utils';

@rendersItemType('Journal', ItemViewMode.Full)
@Component({
  selector: 'ds-journal',
  styleUrls: ['./themes/journal.component.mantis.scss'],
  templateUrl: './themes/journal.component.mantis.html'
})
/**
 * The component for displaying metadata and relations of an item of the type Journal
 */
export class JournalComponent extends ItemComponent {
  /**
   * The volumes related to this journal
   */
  volumes$: Observable<Item[]>;

  ngOnInit(): void {
    super.ngOnInit();

    if (isNotEmpty(this.resolvedRelsAndTypes$)) {
      this.volumes$ = this.resolvedRelsAndTypes$.pipe(
        filterRelationsByTypeLabel('isVolumeOfJournal'),
        relationsToItems(this.item.id)
      );
    }
  }
}
