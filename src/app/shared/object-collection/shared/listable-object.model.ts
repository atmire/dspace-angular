import { EquatableObject } from '../../../core/utilities/equatable';
import { GenericConstructor } from '../../../core/shared/generic-constructor';

export abstract class ListableObject extends EquatableObject<ListableObject> {
  /**
   * Method that returns as which type of object this object should be rendered
   */
  public abstract getRenderTypes(): (
    | string
    | GenericConstructor<ListableObject>
  )[];
}
