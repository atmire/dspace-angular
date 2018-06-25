import { Component, OnInit } from '@angular/core';
import { RemoteData } from '../../core/data/remote-data';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { PaginatedList } from '../../core/data/paginated-list';
import { ItemDataService } from '../../core/data/item-data.service';
import { Observable } from 'rxjs/Observable';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { SortDirection, SortOptions } from '../../core/cache/models/sort-options.model';
import { Item } from '../../core/shared/item.model';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, PRIMARY_OUTLET, UrlSegmentGroup } from '@angular/router';
import { hasValue } from '../../shared/empty.util';
import { Collection } from '../../core/shared/collection.model';
import { Metadatum } from '../../core/shared/metadatum.model';
import { PageInfo } from '../../core/shared/page-info.model';

@Component({
  selector: 'ds-browse-by-author-page',
  styleUrls: ['./browse-by-author-page.component.scss'],
  templateUrl: './browse-by-author-page.component.html'
})
export class BrowseByAuthorPageComponent implements OnInit {

  authorRDObs: Observable<RemoteData<PaginatedList<Metadatum>>>;
  paginationConfig: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'browse-by-author-pagination',
    currentPage: 1,
    pageSize: 5
  });
  sortConfig: SortOptions = new SortOptions('dc.contributor.author', SortDirection.ASC);
  subs: Subscription[] = [];
  currentUrl: string;

  public constructor(private itemDataService: ItemDataService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.currentUrl = this.route.snapshot.pathFromRoot
      .map((snapshot) => (snapshot.routeConfig) ? snapshot.routeConfig.path : '')
      .join('/');
    this.updatePage({
      pagination: this.paginationConfig,
      sort: this.sortConfig
    });
    this.subs.push(
      Observable.combineLatest(
        this.route.params,
        this.route.queryParams,
        (params, queryParams, ) => {
          return Object.assign({}, params, queryParams);
        })
        .subscribe((params) => {
          const page = +params.page || this.paginationConfig.currentPage;
          const pageSize = +params.pageSize || this.paginationConfig.pageSize;
          const sortDirection = params.sortDirection || this.sortConfig.direction;
          const startsWith = +params.query || params.query || '';
          const pagination = Object.assign({},
            this.paginationConfig,
            { currentPage: page, pageSize: pageSize }
          );
          const sort = Object.assign({},
            this.sortConfig,
            { direction: sortDirection, field: params.sortField }
          );
          this.updatePage({
            pagination: pagination,
            sort: sort,
            startsWith: startsWith
          });
        }));
  }

  updatePage(searchOptions) {
    const mockValues = [
      Object.assign(new Metadatum(), {
        key: 'dc.contributor.author',
        value: 'De Langhe Kristof'
      }),
      Object.assign(new Metadatum(), {
        key: 'dc.contributor.author',
        value: 'Hofstede Lotte'
      }),
      Object.assign(new Metadatum(), {
        key: 'dc.contributor.author',
        value: 'Lowel Art'
      }),
      Object.assign(new Metadatum(), {
        key: 'dc.contributor.author',
        value: 'Ponsaerts Raf'
      }),
      Object.assign(new Metadatum(), {
        key: 'dc.contributor.author',
        value: 'Jackson Samuel'
      }),
      Object.assign(new Metadatum(), {
        key: 'dc.contributor.author',
        value: 'Murphy Eddy'
      }),
    ] as Metadatum[];
    mockValues.sort((a, b) => {
      if (a.value < b.value) {
        return (searchOptions.sort.direction === SortDirection.ASC) ? -1 : 1;
      }
      if (a.value > b.value) {
        return (searchOptions.sort.direction === SortDirection.DESC) ? -1 : 1;
      }
      return 0;
    });
    const pageInfo = Object.assign(new PageInfo(), {
      elementsPerPage: searchOptions.pagination.pageSize,
      currentPage: searchOptions.pagination.currentPage,
      totalElements: mockValues.length
    });
    const start = pageInfo.elementsPerPage * (pageInfo.currentPage - 1);
    let end = start + pageInfo.elementsPerPage;
    if (end > pageInfo.totalElements) {
      end = pageInfo.totalElements;
    }
    this.authorRDObs = Observable.of(new RemoteData(
      false,
      false,
      true,
      undefined,
      new PaginatedList(pageInfo, mockValues.slice(start, end))
    ));
  }

  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }

}
