import { CustomizationComponent } from './customization.component';
import { Route } from '@angular/router';

export const CUSTOMIZATION_ROUTES: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: CustomizationComponent
  },
]
