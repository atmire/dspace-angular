import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ItemDataService,
  getFirstCompletedRemoteData,
  RemoteData,
  Item,
  followLink,
} from '@dspace/core';
import { from, mergeMap, toArray, BehaviorSubject, Subscription } from 'rxjs';
import {
  ItemGridElementComponent,
} from '../../../../../../src/app/shared/object-grid/item-grid-element/item-types/item/item-grid-element.component';
import {
  ThemedLoadingComponent,
} from '../../../../../../src/app/shared/loading/themed-loading.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'lib-featured-items',
  standalone: true,
  imports: [
    ItemGridElementComponent,
    ThemedLoadingComponent,
    AsyncPipe,
  ],
  templateUrl: './featured-items.component.html',
  styleUrl: './featured-items.component.scss'
})
export class FeaturedItemsComponent implements OnInit, OnDestroy {
  featuredItems$: BehaviorSubject<RemoteData<Item>[]> = new BehaviorSubject([]);
  subs: Subscription[] = [];

    constructor(
      protected itemDataService: ItemDataService,
    ) {
      this.featuredItems$.subscribe((t) => {console.log('this.featuredItems$', t)});
    }

  ngOnInit(): void {
    const itemIds = [
      'ab949daf-405c-4a84-8c4a-a7bd883fd7d2',
      '0bc64a68-f318-474e-b70c-1fa5e0eb6dbe',
      '2574d334-41d8-481e-be5a-cf2980ee17f0',
    ]
    this.subs.push(from(itemIds).pipe(
      mergeMap((id: string) =>
        this.itemDataService.findById(id, true, true, followLink('thumbnail')).pipe(
          getFirstCompletedRemoteData()
        )
      ),
      toArray(),
    ).subscribe((items: RemoteData<Item>[]) => this.featuredItems$.next(items)));
  }

  ngOnDestroy(): void {
      this.subs.forEach((sub) => sub.unsubscribe());
  }
}
