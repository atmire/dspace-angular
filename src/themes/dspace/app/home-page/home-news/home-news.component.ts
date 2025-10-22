import { Component } from '@angular/core';

import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';
import {
  FeaturedItemsComponent
} from '@dspace/customization';

@Component({
  selector: 'ds-themed-home-news',
  styleUrls: ['./home-news.component.scss'],
  templateUrl: './home-news.component.html',
  imports: [
    FeaturedItemsComponent
  ],
  standalone: true,
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent extends BaseComponent {}

