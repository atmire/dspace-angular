import { MetadataRepresentationType } from '../../../../core/shared/metadata-representation/metadata-representation.model';
import { Component } from '@angular/core';
import { MetadataRepresentationListElementComponent } from '../metadata-representation-list-element.component';
import { metadataRepresentationComponent } from '../../../metadata-representation/metadata-representation.decorator';

@metadataRepresentationComponent(
  'Publication',
  MetadataRepresentationType.PlainText
)
// For now, authority controlled fields are rendered the same way as plain text fields
@metadataRepresentationComponent(
  'Publication',
  MetadataRepresentationType.AuthorityControlled
)
@Component({
  selector: 'ds-plain-text-metadata-list-element',
  templateUrl: './plain-text-metadata-list-element.component.html',
})
/**
 * A component for displaying MetadataRepresentation objects in the form of plain text
 * It will simply use the value retrieved from MetadataRepresentation.getValue() to display as plain text
 */
export class PlainTextMetadataListElementComponent extends MetadataRepresentationListElementComponent {}
