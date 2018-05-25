import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowseByTitlePageComponent } from './browse-by-title-page.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: BrowseByTitlePageComponent }
    ])
  ]
})
export class BrowseByTitlePageRoutingModule { }
