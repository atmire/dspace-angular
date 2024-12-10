import { combineLatest as observableCombineLatest } from 'rxjs';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { hasValue } from '../../shared/empty.util';
import {
  BrowseByMetadataPageComponent,
  browseParamsToOptions,
} from '../browse-by-metadata-page/browse-by-metadata-page.component';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
import { BrowseService } from '../../core/browse/browse.service';
import { SortDirection, SortOptions } from '../../core/cache/models/sort-options.model';
import { PaginationService } from '../../core/pagination/pagination.service';
import { map, switchMap } from 'rxjs/operators';
import { APP_CONFIG, AppConfig } from '../../../config/app-config.interface';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';

@Component({
  selector: 'ds-browse-by-title-page',
  styleUrls: ['../browse-by-metadata-page/browse-by-metadata-page.component.scss'],
  templateUrl: '../browse-by-metadata-page/browse-by-metadata-page.component.html'
})
/**
 * Component for browsing items by title (dc.title)
 */
export class BrowseByTitlePageComponent extends BrowseByMetadataPageComponent {

  public constructor(protected route: ActivatedRoute,
                     protected browseService: BrowseService,
                     protected dsoService: DSpaceObjectDataService,
                     protected paginationService: PaginationService,
                     protected router: Router,
                     @Inject(APP_CONFIG) public appConfig: AppConfig,
                     public dsoNameService: DSONameService,
  ) {
    super(route, browseService, dsoService, paginationService, router, appConfig, dsoNameService);
  }

  ngOnInit(): void {
    this.browseId = this.route.snapshot.params.id;
    this.subs.push(
      this.browseService.getConfiguredSortDirection(this.browseId, SortDirection.ASC).pipe(
        map((sortDir) => new SortOptions(this.browseId, sortDir)),
        switchMap((sortConfig) => {
          this.currentSort$ = this.paginationService.getCurrentSort(this.paginationConfig.id, sortConfig, false);
          this.currentPagination$ = this.paginationService.getCurrentPagination(this.paginationConfig.id, this.paginationConfig);
          return observableCombineLatest([this.route.params, this.route.queryParams, this.currentPagination$, this.currentSort$]).pipe(
            map(([routeParams, queryParams, currentPagination, currentSort]) => ({
              params: Object.assign({}, routeParams, queryParams), currentPagination, currentSort
            }))
          );
        })).subscribe(({ params, currentPagination, currentSort }) => {
        this.startsWith = +params.startsWith || params.startsWith;
        this.updatePageWithItems(browseParamsToOptions(params, currentPagination, currentSort, this.browseId, this.fetchThumbnails), undefined, undefined);
        this.updateParent(params.scope);
        this.updateLogo();
        this.updateStartsWithTextOptions();
      }));
  }

  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }

}
