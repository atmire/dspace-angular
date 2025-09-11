import {
  autoserialize,
  deserialize,
} from 'cerialize';

import { typedObject } from '../../cache/builders/build-decorators';
import { CacheableObject } from '../../cache/cacheable-object.model';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { HALLink } from '../hal-link.model';
import { ResourceType } from '../resource-type';
import { Identifier } from './identifier.model';
import { IDENTIFIERS } from './identifier-data.resource-type';

@typedObject
export class IdentifierData implements CacheableObject {
  static type = IDENTIFIERS;
  /**
   * The type for this IdentifierData
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The
   */
  @autoserialize
  identifiers: Identifier[];

  /**
   * The {@link HALLink}s for this IdentifierData
   */
   @deserialize
     _links: {
     self: HALLink;
   };
}
