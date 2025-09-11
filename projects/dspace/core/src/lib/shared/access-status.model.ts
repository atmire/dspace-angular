import { typedObject } from '../cache/builders/build-decorators';
import { CacheableObject } from '../cache/cacheable-object.model';
import { HALLink } from './hal-link.model';
import { ResourceType } from './resource-type';
import { excludeFromEquals } from '../utilities/equals.decorators';
import { autoserialize, deserialize } from 'cerialize';

import { ACCESS_STATUS } from './access-status.resource-type';

@typedObject
export class AccessStatusObject implements CacheableObject {
  static type = ACCESS_STATUS;

  /**
   * The type for this AccessStatusObject
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The access status value
   */
  @autoserialize
  status: string;

  /**
   * The embargo date value
   */
  @autoserialize
  embargoDate: string;

  /**
   * The {@link HALLink}s for this AccessStatusObject
   */
   @deserialize
     _links: {
     self: HALLink;
   };
}
