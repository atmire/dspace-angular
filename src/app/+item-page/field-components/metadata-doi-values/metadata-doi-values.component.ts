import { Component, Input } from '@angular/core';

import { MetadataValuesComponent } from '../metadata-values/metadata-values.component';
import { MetadataValue } from '../../../core/shared/metadata.models';

@Component({
  selector: 'ds-metadata-doi-values',
  styleUrls: ['./metadata-doi-values.component.scss'],
  templateUrl: './metadata-doi-values.component.html'
})
export class MetadataDoiValuesComponent extends MetadataValuesComponent {

  /**
   * Optional text to replace the links with
   * If undefined, the metadata value (doi) is displayed
   */
  @Input() linktext: any;

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

  getHref(doi: string) {
    let suffix = doi;
    if (doi.startsWith('doi:')) {
      suffix = doi.substring(4, doi.length);
    }
    return 'https://doi.org/' + suffix;
  }
}
