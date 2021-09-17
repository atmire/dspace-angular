import { Component } from '@angular/core';
import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';

@Component({
  selector: 'ds-home-news',
  templateUrl: './home-news.component.html',
  // templateUrl: '../../../../../app/home-page/home-news/home-news.component.html',
  // styleUrls: ['./home-news.component.scss'],
  styleUrls: ['../../../../../app/home-page/home-news/home-news.component.scss'],
})
export class HomeNewsComponent extends BaseComponent {
}
