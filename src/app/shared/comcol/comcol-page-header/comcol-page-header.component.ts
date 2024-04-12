import { Component, Input } from '@angular/core';
import {ContextHelpDirectiveInput} from '../../context-help.directive';

@Component({
  selector: 'ds-comcol-page-header',
  styleUrls: ['./comcol-page-header.component.scss'],
  templateUrl: './comcol-page-header.component.html',
})
export class ComcolPageHeaderComponent {
  contextHelp = {
    content: 'context.help.comcol-header',
    id: 'comcol-header',
    iconPlacement: 'right',
    tooltipPlacement: ['right', 'bottom']
  } as ContextHelpDirectiveInput;

  @Input() name: string;
}
