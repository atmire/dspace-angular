import { Component } from '@angular/core';
import { StatisticsPageComponent } from '../statistics-page/statistics-page.component';
import { UsageReportDataService } from '../../core/statistics/usage-report-data.service';
import { ActivatedRoute , Router} from '@angular/router';
import { Collection } from '../../core/shared/collection.model';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { AuthService } from '../../core/auth/auth.service';
import {ContextHelpDirectiveInput} from '../../shared/context-help.directive';

/**
 * Component representing the statistics page for a collection.
 */
@Component({
  selector: 'ds-collection-statistics-page',
  templateUrl: '../statistics-page/statistics-page.component.html',
  styleUrls: ['./collection-statistics-page.component.scss']
})
export class CollectionStatisticsPageComponent extends StatisticsPageComponent<Collection> {
  contextHelp = {
    content: 'context.help.collection-statistics-page',
    id: 'collection-statistics-page',
    iconPlacement: 'right',
    tooltipPlacement: ['right', 'bottom']
  } as ContextHelpDirectiveInput;

  /**
   * The report types to show on this statistics page.
   */
  types: string[] = [
    'TotalVisits',
    'TotalVisitsPerMonth',
    'TopCountries',
    'TopCities',
  ];

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected usageReportService: UsageReportDataService,
    protected nameService: DSONameService,
    protected authService: AuthService
  ) {
    super(
      route,
      router,
      usageReportService,
      nameService,
      authService,
    );
  }
}
