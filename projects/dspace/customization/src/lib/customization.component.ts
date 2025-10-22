import { Component } from '@angular/core';
import { FeaturedItemsComponent } from './featured-items/featured-items.component';

@Component({
  selector: 'lib-customization',
  standalone: true,
  imports: [
    FeaturedItemsComponent,
  ],
  templateUrl: './customization.component.html',
  styles: ``
})
export class CustomizationComponent {

}
