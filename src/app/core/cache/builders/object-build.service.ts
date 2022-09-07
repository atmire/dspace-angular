import { Inject, Injectable } from '@angular/core';
import { hasValue, isNotEmpty } from '../../../shared/empty.util';
import { GenericConstructor } from '../../shared/generic-constructor';
import { getClassForType } from './build-decorators';
import { NativeWindowRef, NativeWindowService } from '../../services/window.service';

@Injectable()
export class ObjectBuildService {
  constructor(@Inject(NativeWindowService) private _window: NativeWindowRef) {
  }

  /**
   * When an object is returned from the store, it's possibly a plain javascript object (in case
   * it was first instantiated on the server). This method will turn it in to an instance of the
   * class corresponding with its type property. If it doesn't have one, or we can't find a
   * constructor for that type, it will remain a plain object.
   *
   * @param obj  The object to turn in to a class instance based on its type property
   */
  public plainObjectToInstance<T>(obj: any): T {
    const type: GenericConstructor<T> = getClassForType(obj.type);
    return this.createInstance(type, obj);
  }

  /**
   * Recursive method that uses a type and json object to create an instance using the Cerialize mapping
   * @param type The class / constructor of the instance
   * @param obj The JSON object to transform into an instance
   * @private
   */
  private createInstance<T>(type: GenericConstructor<T>, obj: any) {
    let object;
    if (typeof type === 'function') {
      object = Object.assign(new type(), obj) as T;
    } else {
      object = Object.assign({}, obj) as T;
    }
    if (this._window.nativeWindow) {
      let fieldsForType = (this._window.nativeWindow as any).__CerializeTypeMap.get(type);
      if (isNotEmpty(fieldsForType)) {
        (this._window.nativeWindow as any).__CerializeTypeMap.get(type).forEach((field: { deserializedKey: string, deserializedType: GenericConstructor<any> }) => {
          if (hasValue(field.deserializedType)) {
            const fieldValue = object[field.deserializedKey];
            let newFieldValue;
            if (hasValue(fieldValue)) {
              if (Array.isArray(fieldValue)) {
                newFieldValue = fieldValue.map((json: object) => this.createInstance(field.deserializedType, json));
              } else if (typeof fieldValue === 'object') {
                newFieldValue = this.createInstance(field.deserializedType, fieldValue);
              }
              object[field.deserializedKey] = newFieldValue || fieldValue;
            }
          }
        });
      }
    }
    return object;
  }
}
