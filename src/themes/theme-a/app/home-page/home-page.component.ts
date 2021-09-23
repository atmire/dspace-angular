import { Component, OnInit } from '@angular/core';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { Site } from '../../../../app/core/shared/site.model';
import { ActivatedRoute } from '@angular/router';
import { CommunityDataService } from '../../../../app/core/data/community-data.service';
import { getFirstSucceededRemoteDataPayload } from '../../../../app/core/shared/operators';
import { PaginatedList } from '../../../../app/core/data/paginated-list.model';
import { Community } from '../../../../app/core/shared/community.model';
import { BehaviorSubject } from 'rxjs';
import { getCommunityPageRoute } from '../../../../app/community-page/community-page-routing-paths';
import { filter } from 'rxjs/operators';
import { isNotEmpty } from '../../../../app/shared/empty.util';

@Component({
  selector: 'ds-home-page',
  templateUrl: './home-page.component.html',
  // templateUrl: '../../../../app/home-page/home-page.component.html',
  // styleUrls: ['./home-page.component.scss'],
  styleUrls: ['../../../../app/home-page/home-page.component.scss'],
})
export class HomePageComponent extends BaseComponent implements OnInit {
  communityRoute$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  constructor(
    protected route: ActivatedRoute,
    protected cds: CommunityDataService
  ) {
    super(route);
  }

  ngOnInit() {
    this.cds.findTop({ elementsPerPage:1 }).pipe(
      getFirstSucceededRemoteDataPayload(),
      filter((list: PaginatedList<Community>) => isNotEmpty(list))
    ).subscribe((list: PaginatedList<Community>) => {
      this.communityRoute$.next(getCommunityPageRoute(list.page[0].uuid));
    });
  }
}
