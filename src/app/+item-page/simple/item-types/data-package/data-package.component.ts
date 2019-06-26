import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../../../../core/shared/item.model';
import {
  ItemViewMode,
  rendersItemType
} from '../../../../shared/items/item-type-decorator';
import { ItemComponent } from '../shared/item.component';
import { MetadataRepresentation } from '../../../../core/shared/metadata-representation/metadata-representation.model';
import { filterRelationsByTypeLabel, relationsToItems } from '../shared/item-relationships-utils';

@rendersItemType('DataPackage', ItemViewMode.Full)
@Component({
  selector: 'ds-datapackage',
  styleUrls: ['./data-package.component.scss'],
  templateUrl: './data-package.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataPackageComponent extends ItemComponent implements OnInit {
  /**
   * The authors related to this publication
   */
  authors$: Observable<MetadataRepresentation[]>;

  dataFiles$: Observable<Item[]>;
  publications$: Observable<Item[]>;

  ngOnInit(): void {
    super.ngOnInit();

    if (this.resolvedRelsAndTypes$) {

      this.authors$ = this.buildRepresentations('Person', 'dc.contributor.author');

      this.dataFiles$ = this.resolvedRelsAndTypes$.pipe(
        filterRelationsByTypeLabel('isDataFileOfDataPackage'),
        relationsToItems(this.item.id)
      );
      this.publications$ = this.resolvedRelsAndTypes$.pipe(
        filterRelationsByTypeLabel('isPublicationOfDataPackage'),
        relationsToItems(this.item.id)
      );

    }
  }
}
