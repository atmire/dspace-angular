import { Component, Input } from '@angular/core';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { ViewMode } from '../../+search-page/search-options.model';
import { PaginationComponentOptions } from '../pagination/pagination-component-options.model';
import { SortOptions } from '../../core/cache/models/sort-options.model';
import { fadeIn, fadeInOut } from '../animations/fade';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'ds-browse-by-title',
  styleUrls: ['./browse-by-title.component.scss'],
  templateUrl: './browse-by-title.component.html',
  animations: [
    fadeIn,
    fadeInOut
  ]
})
export class BrowseByTitleComponent {
  @Input() title: string;
  @Input() objects: Observable<RemoteData<PaginatedList<DSpaceObject>>>;
  @Input() paginationConfig: PaginationComponentOptions;
  @Input() sortConfig: SortOptions;
  @Input() currentUrl: string;
  query: string;
}
