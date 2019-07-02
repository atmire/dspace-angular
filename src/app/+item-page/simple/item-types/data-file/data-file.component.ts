import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../../../../core/shared/item.model';
import {
  ItemViewMode,
  rendersItemType
} from '../../../../shared/items/item-type-decorator';
import { ItemComponent } from '../shared/item.component';
import { MetadataRepresentation } from '../../../../core/shared/metadata-representation/metadata-representation.model';
import { getRelatedItemsByTypeLabel } from '../../../../+item-page/simple/item-types/shared/item-relationships-utils';

@rendersItemType('DataFile', ItemViewMode.Full)
@Component({
  selector: 'ds-datafile',
  styleUrls: ['./data-file.component.scss'],
  templateUrl: './data-file.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataFileComponent extends ItemComponent implements OnInit {
  /**
   * The authors related to this publication
   */
  authors$: Observable<MetadataRepresentation[]>;

  dataPackages$: Observable<Item[]>;

  ngOnInit(): void {
    super.ngOnInit();

    if (this.resolvedRelsAndTypes$) {

      this.authors$ = this.buildRepresentations('Person', 'dc.contributor.author');

      this.dataPackages$ = this.resolvedRelsAndTypes$.pipe(
        getRelatedItemsByTypeLabel(this.item.id, 'isDataPackageOfDataFile')
      );

    }
  }
}
