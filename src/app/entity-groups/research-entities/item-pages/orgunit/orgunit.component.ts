import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../../../../core/shared/item.model';
import { ItemViewMode, rendersItemType } from '../../../../shared/items/item-type-decorator';
import { isNotEmpty } from '../../../../shared/empty.util';
import { ItemComponent } from '../../../../+item-page/simple/item-types/shared/item.component';
import {
  getRelatedItemsByTypeLabel,
  RelationshipSide
} from '../../../../+item-page/simple/item-types/shared/item-relationships-utils';

@rendersItemType('OrgUnit', ItemViewMode.Full)
@Component({
  selector: 'ds-orgunit',
  styleUrls: ['./themes/orgunit.component.mantis.scss'],
  templateUrl: './themes/orgunit.component.mantis.html'
})
/**
 * The component for displaying metadata and relations of an item of the type Organisation Unit
 */
export class OrgunitComponent extends ItemComponent implements OnInit {
  /**
   * The people related to this organisation unit
   */
  people$: Observable<Item[]>;

  /**
   * The projects related to this organisation unit
   */
  projects$: Observable<Item[]>;

  /**
   * The publications related to this organisation unit
   */
  publications$: Observable<Item[]>;

  /**
   * The parent org units in the hierarchical tree related to this organisation unit
   */
  parentOrgUnits$: Observable<Item[]>;

  /**
   * The child org units in the hierarchical tree related to this organisation unit
   */
  childOrgUnits$: Observable<Item[]>;

  ngOnInit(): void {
    super.ngOnInit();

    if (isNotEmpty(this.resolvedRelsAndTypes$)) {
      this.people$ = this.resolvedRelsAndTypes$.pipe(
        getRelatedItemsByTypeLabel(this.item.id, 'isPersonOfOrgUnit')
      );

      this.projects$ = this.resolvedRelsAndTypes$.pipe(
        getRelatedItemsByTypeLabel(this.item.id, 'isProjectOfOrgUnit')
      );

      this.publications$ = this.resolvedRelsAndTypes$.pipe(
        getRelatedItemsByTypeLabel(this.item.id, 'isPublicationOfOrgUnit')
      );

      this.parentOrgUnits$ = this.resolvedRelsAndTypes$.pipe(
        getRelatedItemsByTypeLabel(this.item.id, 'isChildOrgUnitOf', RelationshipSide.right)
      );

      this.childOrgUnits$ = this.resolvedRelsAndTypes$.pipe(
        getRelatedItemsByTypeLabel(this.item.id, 'isParentOrgUnitOf', RelationshipSide.left)
      );
    }
  }}
