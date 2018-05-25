import { NgModule } from '@angular/core';
import { BrowseByTitlePageRoutingModule } from './browse-by-title-page-routing.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { BrowseByTitlePageComponent } from './browse-by-title-page.component';
import { ItemDataService } from '../core/data/item-data.service';

@NgModule({
  imports: [
    BrowseByTitlePageRoutingModule,
    CommonModule,
    SharedModule
  ],
  declarations: [
    BrowseByTitlePageComponent
  ],
  providers: [
    ItemDataService
  ]
})
export class BrowseByTitlePageModule {
}
