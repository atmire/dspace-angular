import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  Input,
  TemplateRef
} from '@angular/core';
import { PlacementArray } from '@ng-bootstrap/ng-bootstrap/util/positioning';
import { PlacementDir } from './placement-dir.model';
import { ThemedComponent } from '../theme-support/themed.component';
import { ContextHelpWrapperComponent } from './context-help-wrapper.component';
import { ThemeService } from '../theme-support/theme.service';

/**
 * Themed wrapper for ContextHelpWrapperComponent
 */
@Component({
  selector: 'ds-themed-context-help-wrapper',
  styleUrls: [],
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedContextHelpWrapperComponent extends ThemedComponent<ContextHelpWrapperComponent> {
  @Input() templateRef: TemplateRef<any>;
  @Input() id: string;
  @Input() tooltipPlacement?: PlacementArray = [];
  @Input() iconPlacement?: PlacementDir = 'left';
  @Input() dontParseLinks: boolean;
  @Input() content;


  protected inAndOutputNames: (keyof ContextHelpWrapperComponent & keyof this)[] = ['templateRef', 'id', 'tooltipPlacement', 'iconPlacement', 'dontParseLinks', 'content'];

  constructor(
    protected resolver: ComponentFactoryResolver,
    protected cdr: ChangeDetectorRef,
    protected themeService: ThemeService
  ) {
    super(resolver, cdr, themeService);
  }

  protected getComponentName(): string {
    return 'ContextHelpWrapperComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/shared/context-help-wrapper/context-help-wrapper.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import('./context-help-wrapper.component');
  }
}
