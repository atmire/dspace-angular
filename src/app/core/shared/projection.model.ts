/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { isNotEmpty } from '../../shared/empty.util';
import { Item } from './item.model';
import { ItemType } from './item-relationships/item-type.model';

export class Projection {
  private readonly name: string;

  private readonly param: string[];

  constructor(name: string, ...param) {
    this.name = name;
    this.param = param;
  }

  public static CheckSideItemInRelationShip(item: Item): Projection {
    return new Projection(
      'CheckSideItemInRelationship', 'checkSideItemInRelationship', item.uuid
    )
  }

  public static CheckSideEntityInRelationshipType(itemType: ItemType): Projection {
    return new Projection(
      'CheckSideEntityInRelationshipType', 'checkSideEntityInRelationshipType', itemType.label
    )
  }

  public toString(): string {
    let out = `projection=${encodeURIComponent(this.name)}`;

    if (isNotEmpty(this.param)) {
      const params = this.param.map(p => encodeURIComponent(p))
                         .join('=');
      out += '&' + params;
    }

    return out;
  }
}
