import { Component } from '@angular/core';
import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';

@Component({
  selector: 'ds-navbar',
  templateUrl: './navbar.component.html',
  // templateUrl: '../../../../app/navbar/navbar.component.html',
  // styleUrls: ['./navbar.component.scss'],
  styleUrls: ['../../../../app/navbar/navbar.component.scss'],
})
export class NavbarComponent extends BaseComponent {
}
