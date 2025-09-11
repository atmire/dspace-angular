import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import { hasNoValue } from '@dspace/utils';

/**
 * Returns true if the passed value is null or undefined.
 */
@Pipe({ name: 'dsHasNoValue' })
export class HasNoValuePipe implements PipeTransform {
  transform(value: any): boolean {
    return hasNoValue(value);
  }
}
