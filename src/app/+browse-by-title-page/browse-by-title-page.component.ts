import { Component, OnInit } from '@angular/core';
import { RemoteData } from '../core/data/remote-data';
import { DSpaceObject } from '../core/shared/dspace-object.model';
import { PaginatedList } from '../core/data/paginated-list';
import { ItemDataService } from '../core/data/item-data.service';
import { Observable } from 'rxjs/Observable';
import { PaginationComponentOptions } from '../shared/pagination/pagination-component-options.model';

@Component({
  selector: 'ds-browse-by-title-page',
  styleUrls: ['./browse-by-title-page.component.scss'],
  templateUrl: './browse-by-title-page.component.html'
})
export class BrowseByTitlePageComponent implements OnInit {

  objects: Observable<RemoteData<PaginatedList<DSpaceObject>>>;
  currentUrl: string;
  config: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'browse-by-title-pagination',
    pageSize: 20
  });

  public constructor(private itemDataService: ItemDataService) {

  }

  ngOnInit(): void {
    this.objects = this.itemDataService.findAll();
    this.currentUrl = 'browse/title'
  }

}
