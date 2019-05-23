import { Component, Input } from '@angular/core';
import { MetadataValue } from '../../../core/shared/metadata.models';

/**
 * This component renders the configured 'values' into the ds-metadata-field-wrapper component.
 * It puts the given 'separator' between each two values.
 */
@Component({
  selector: 'ds-metadata-values',
  styleUrls: ['./metadata-values.component.scss'],
  templateUrl: './metadata-values.component.html'
})
export class MetadataValuesComponent {

  /**
   * The metadata values to display
   */
  @Input() mdValues: MetadataValue[];

  /**
   * The seperator used to split the metadata values (can contain HTML)
   */
  @Input() separator: string;

  /**
   * The label for this iteration of metadata values
   */
  @Input() label: string;

  getValue(mdValue: MetadataValue) {
    let result = mdValue.value;
    if (result.match('(\\d{4}-\\d\\d-\\d\\d)T\\d\\d:\\d\\d:\\d\\dZ')) {
      result = result.substring(0, result.indexOf('T'));
    }
    return result;
  }

}
