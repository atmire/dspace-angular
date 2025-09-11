import { typedObject } from '../../cache/builders/build-decorators';
import { CacheableObject } from '../../cache/cacheable-object.model';
import { HALLink } from '../hal-link.model';
import { ResourceType } from '../resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { autoserialize, deserialize } from 'cerialize';

import { SCRIPT } from './script.resource-type';
import { ScriptParameter } from './script-parameter.model';

/**
 * Object representing a script
 */
@typedObject
export class Script implements CacheableObject {
  static type = SCRIPT;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The identifier of this script
   */
  @autoserialize
  id: string;

  /**
   * The name of this script
   */
  @autoserialize
  name: string;

  /**
   * A short description of this script
   */
  @autoserialize
  description: string;

  /**
   * The available parameters for this script
   */
  @autoserialize
  parameters: ScriptParameter[];

  /**
   * The {@link HALLink}s for this Script
   */
  @deserialize
  _links: {
    self: HALLink,
  };
}
